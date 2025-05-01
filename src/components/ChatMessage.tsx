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
          className={`text-xs mt-2 ${
            isUser ? "text-blue-200" : "text-gray-500"
          }`}
          suppressHydrationWarning
        >
          {formattedTime}
        </div>
      </div>
    </div>
  );
}
