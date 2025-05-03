"use client";

import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import ChatInput from "@/components/ChatInput";
import ChatMessage from "@/components/ChatMessage";
import ModelSelector from "@/components/ModelSelector";
import { getChatHistory, updateChatHistory } from "@/actions/chat";
import { streamChatCompletion } from "@/actions/chat-stream";
import { Message } from "@/types/chat";
import { ModelTier } from "@/lib/groq-models";
import { getTierUpgradeInfo, formatTierName } from "@/lib/user-tier";
import { getUserTierAction } from "@/actions/user-tier-action";

export default function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = use(params);
  const { userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isChatNotFound, setIsChatNotFound] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("llama-3.1-8b-instant");
  const [userTier, setUserTier] = useState<ModelTier>("free"); // Default until loaded
  const [tierLoaded, setTierLoaded] = useState(false); // Track if tier has been loaded
  const [tierUpgradeInfo, setTierUpgradeInfo] = useState({
    canUpgrade: false,
    upgradeText: "Upgrade",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load user tier
  useEffect(() => {
    async function loadUserTier() {
      if (userId) {
        try {
          const tier = await getUserTierAction(userId);
          setUserTier(tier);
          setTierLoaded(true);
          setTierUpgradeInfo(getTierUpgradeInfo(tier));
        } catch (error) {
          console.error("Failed to load user tier:", error);
        }
      }
    }

    loadUserTier();
  }, [userId]);

  // Load chat history
  useEffect(() => {
    const loadChat = async () => {
      try {
        const chat = await getChatHistory(chatId);

        if (!chat) {
          console.error(`Chat not found: ${chatId}`);
          setIsChatNotFound(true);
          if (chatId.startsWith("private-")) {
            setTimeout(() => router.push("/chat"), 1500);
          } else {
            router.push("/chat");
          }
          return;
        }

        setMessages(chat.messages);
      } catch (error) {
        console.error("Failed to load chat:", error);
        setIsError(true);
        setDebugInfo(
          `Error loading chat: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadChat();
  }, [chatId, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content: string) => {
    if (isChatNotFound) {
      router.push("/chat");
      return;
    }

    // Reset error state
    setIsError(false);
    setDebugInfo(null);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
      role: "user",
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Prepare messages for API in the format Groq expects
      const apiMessages = [
        {
          role: "system",
          content: "You are a helpful, knowledgeable assistant.",
        },
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: "user", content },
      ];

      // Create an empty assistant message for streaming
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        content: "",
        isUser: false,
        timestamp: new Date(),
        role: "assistant",
      };

      updatedMessages.push(assistantMessage);
      setMessages(updatedMessages);
      setIsLoading(false);
      setIsStreaming(true);

      // Call the server action for streaming with selected model
      const stream = await streamChatCompletion({
        messages: apiMessages,
        isPrivateMode: false,
        model: selectedModel,
      });

      // Process the streamed response
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let buffer = ""; // Buffer for incomplete JSON chunks

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Process complete lines in the buffer
          const lines = buffer.split("\n");
          // Keep the last (potentially incomplete) line in the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            if (trimmedLine.startsWith("data: ")) {
              const data = trimmedLine.substring(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || "";
                if (content) {
                  fullContent += content;
                  setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: fullContent }
                        : msg
                    )
                  );
                }
              } catch (e) {
                console.error("Error parsing JSON:", e);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error while reading stream:", error);
      } finally {
        reader.releaseLock();
      }

      try {
        const finalMessages = [...updatedMessages];

        const assistantMessageIndex = finalMessages.findIndex(
          (msg) => msg.id === assistantMessageId
        );

        if (assistantMessageIndex !== -1) {
          finalMessages[assistantMessageIndex] = {
            ...finalMessages[assistantMessageIndex],
            content: fullContent,
          };
        }

        await updateChatHistory(chatId, finalMessages);
      } catch (error) {
        console.error("Error updating chat history:", error);
        setDebugInfo(
          `Error updating chat: ${
            error instanceof Error ? error.message : String(error)
          }`
        );

        if (chatId.startsWith("private-")) {
          setTimeout(() => router.push("/chat"), 1500);
        }
      }
    } catch (error) {
      console.error("Error calling chat API:", error);
      setIsError(true);
      setDebugInfo(
        `API error: ${error instanceof Error ? error.message : String(error)}`
      );

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Sorry, there was an error processing your request. Please try again.",
        isUser: false,
        timestamp: new Date(),
        role: "assistant",
      };

      // Update messages only once with the error message
      const messagesWithError = [
        ...updatedMessages.filter(
          (m) => m.role !== "assistant" || m.content !== ""
        ),
        errorMessage,
      ];
      setMessages(messagesWithError);

      try {
        await updateChatHistory(chatId, messagesWithError);
      } catch (updateError) {
        console.error(
          "Error updating chat history after API error:",
          updateError
        );
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
      </div>
    );
  }

  if (isChatNotFound) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-red-50 text-red-700 p-6 rounded-lg max-w-[95%] sm:max-w-md text-center">
          <h3 className="text-xl font-semibold mb-2">Chat not found</h3>
          <p>
            This chat session could not be found. You will be redirected to the
            chat selection page.
          </p>
          {chatId.startsWith("private-") && (
            <p className="mt-4 text-sm">
              Note: Private chats are stored in memory and may not be available
              after a server restart.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Model selector */}
      <div className="border-b border-gray-200 bg-white p-2">
        <div className="max-w-3xl mx-auto flex items-center">
          <div className="w-48 mr-2">
            <div data-user-tier={userTier} className="hidden">
              Tier debug
            </div>
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              userTier={userTier}
            />
          </div>
          <div className="text-xs text-gray-500">
            <span>
              {tierLoaded ? formatTierName(userTier) : "Loading..."} tier ·
              <a href="#" className="text-blue-600 hover:underline ml-1">
                {tierUpgradeInfo.upgradeText}
              </a>
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            content={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))}

        {isError && (
          <div className="flex justify-center my-4">
            <div className="bg-red-50 text-red-700 p-3 rounded-lg max-w-[90%] sm:max-w-[80%] text-center">
              <p>An error occurred. Please try again.</p>
              {debugInfo && (
                <p className="text-xs mt-2 text-red-500 break-words">
                  {debugInfo}
                </p>
              )}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-none max-w-[90%] sm:max-w-[80%]">
              <div className="flex space-x-2">
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {isStreaming && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-none max-w-[90%] sm:max-w-[80%]">
              <div className="inline-block w-1.5 h-4 bg-gray-400 animate-blink"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading || isStreaming || isChatNotFound}
      />
    </>
  );
}
