"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import ChatInput from "@/components/ChatInput";
import ChatMessage from "@/components/ChatMessage";
import ModelSelector from "@/components/ModelSelector";
import { streamChatCompletion } from "@/actions/chat-stream";
import { Message } from "@/types/chat";
import { ModelTier } from "@/lib/groq-models";
import { getTierUpgradeInfo, formatTierName } from "@/lib/user-tier";
import { getUserTierAction } from "@/actions/user-tier-action";

export default function PrivateChatPage() {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isError, setIsError] = useState(false);
  const [selectedModel, setSelectedModel] = useState("llama-3.1-8b-instant");
  const [userTier, setUserTier] = useState<ModelTier>("free"); // Default until loaded
  const [tierLoaded, setTierLoaded] = useState(false); // Track if tier has been loaded
  const [tierUpgradeInfo, setTierUpgradeInfo] = useState({
    canUpgrade: false,
    upgradeText: "Upgrade",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        content:
          "Hello! This is a private chat session. Your conversation will not be saved after you leave.",
        isUser: false,
        timestamp: new Date(),
        role: "assistant",
      },
    ]);
  }, []);

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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content: string) => {
    // Reset error state
    setIsError(false);

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
          content:
            "You are a helpful, knowledgeable assistant. This is a private chat session where messages are not stored long-term.",
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
        isPrivateMode: true,
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
                console.error("Error parsing JSON:", e, "Data:", data);
                // Continue processing other lines even if one fails
              }
            }
          }
        }
      } catch (error) {
        console.error("Error while reading stream:", error);
        // Don't rethrow here, we already have partial content to save
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error("Error calling chat API:", error);
      setIsError(true);

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
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  if (isLoading && messages.length <= 1) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      {/* Private Mode Indicator with Model Selector */}
      <div className="bg-purple-100 border-b border-purple-200 py-2 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center">
          <div className="flex items-center mb-2 sm:mb-0">
            <div className="mr-2 h-5 w-5 flex items-center justify-center rounded-full bg-purple-600 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3 h-3"
              >
                <path
                  fillRule="evenodd"
                  d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-purple-800 font-medium text-sm">
              Private Mode
            </span>
            <span className="ml-2 text-purple-600 text-xs hidden sm:inline">
              Your conversation will not be saved
            </span>
          </div>

          <div className="sm:ml-auto flex items-center">
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
            <div className="text-xs text-purple-600">
              {tierLoaded ? formatTierName(userTier) : "Loading..."} tier ·
              {tierUpgradeInfo.canUpgrade && (
                <a href="#" className="hover:underline ml-1">
                  {tierUpgradeInfo.upgradeText}
                </a>
              )}
            </div>
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
        disabled={isLoading || isStreaming}
      />
    </>
  );
}
