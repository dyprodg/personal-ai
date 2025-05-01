"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createChatHistory } from "@/actions/chat";

// Chat mode options
type ChatMode = "normal" | "private";

export default function ChatPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleModeSelection = async (mode: ChatMode) => {
    try {
      setIsLoading(true);

      if (mode === "private") {
        // For private mode, go directly to the private chat route
        router.push(`/chat/private`);
      } else {
        // For normal mode, create a persistent chat
        const chatId = await createChatHistory("New conversation", false);
        router.push(`/chat/${chatId}`);
      }
    } catch (error) {
      console.error("Failed to create new chat:", error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4 mx-auto w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
          <p className="text-gray-500">Creating a new chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">
          Choose Chat Mode
        </h1>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleModeSelection("normal")}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <div className="flex items-center">
              <div className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3">
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
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-blue-600">Normal</h2>
                <p className="text-sm text-gray-600">Stores chats encrypted</p>
              </div>
            </div>
            <div className="text-blue-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </button>

          <button
            onClick={() => handleModeSelection("private")}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
          >
            <div className="flex items-center">
              <div className="h-8 w-8 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">
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
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                  ></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-purple-600">Private</h2>
                <p className="text-sm text-gray-600">Stores nothing at all</p>
              </div>
            </div>
            <div className="text-purple-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
