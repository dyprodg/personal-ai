"use client";

import MarkdownRenderer from "./MarkdownRenderer";
import { useEffect, useState } from "react";

type MessageProps = {
  content: string;
  isUser: boolean;
  timestamp?: Date;
};

export default function ChatMessage({
  content,
  isUser,
  timestamp = new Date(),
}: MessageProps) {
  // Client-side only time formatting to avoid hydration mismatch
  const [formattedTime, setFormattedTime] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy message: ", err);
    }
  };

  useEffect(() => {
    try {
      // Safely handle timestamp - ensure it's a valid Date object
      const safeDate =
        timestamp instanceof Date && !isNaN(timestamp.getTime())
          ? timestamp
          : new Date();

      // Format time only on the client side
      setFormattedTime(
        safeDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch {
      // Silent fallback to empty string
      setFormattedTime("");
    }
  }, [timestamp]);

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}
      suppressHydrationWarning
    >
      <div
        className={`max-w-[85%] p-4 rounded-lg shadow-sm ${
          isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
        }`}
        suppressHydrationWarning
      >
        {isUser ? (
          <p
            className="text-base whitespace-pre-wrap leading-relaxed"
            suppressHydrationWarning
          >
            {content}
          </p>
        ) : (
          <div className="text-base leading-relaxed" suppressHydrationWarning>
            <MarkdownRenderer content={content} />
          </div>
        )}
        <div
          className={`flex justify-between items-center mt-2 text-xs ${
            isUser ? "text-blue-200" : "text-gray-500"
          }`}
          suppressHydrationWarning
        >
          <span>{formattedTime}</span>
          <button
            onClick={copyToClipboard}
            className={`p-1 rounded hover:bg-opacity-20 ${
              isUser ? "hover:bg-blue-500" : "hover:bg-gray-200"
            }`}
            title="Copy message"
          >
            {copied ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
