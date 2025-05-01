"use client";

import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import ChatInput from "@/components/ChatInput";
import ChatMessage from "@/components/ChatMessage";
import { getChatHistory, updateChatHistory } from "@/actions/chat";
import { Message } from "@/types/chat";

export default function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isError, setIsError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load chat history
  useEffect(() => {
    const loadChat = async () => {
      try {
        const chat = await getChatHistory(chatId);

        if (!chat) {
          // Chat not found or unauthorized, redirect to main chat page
          router.push("/chat");
          return;
        }

        setMessages(chat.messages);
      } catch (error) {
        console.error("Failed to load chat:", error);
        setIsError(true);
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

      // Call the API with streaming
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      // Process the streamed response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let buffer = ""; // Buffer for incomplete JSON chunks

      if (reader) {
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
      }

      // Only update the chat history once, at the end of the operation
      await updateChatHistory(chatId, [...updatedMessages]);
    } catch (error) {
      console.error("Error calling Groq API:", error);
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

      // Update the chat history only once
      await updateChatHistory(chatId, messagesWithError);
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

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
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
            <div className="bg-red-50 text-red-700 p-3 rounded-lg max-w-[80%] text-center">
              <p>An error occurred. Please try again.</p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-none max-w-[80%]">
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
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-none max-w-[80%]">
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
