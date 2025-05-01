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
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-md p-8 border border-gray-200">
        <h1 className="text-4xl font-bold text-center mb-10 text-blue-500">
          Choose Chat Mode
        </h1>

        <div className="space-y-8">
          <div
            onClick={() => handleModeSelection("normal")}
            className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow cursor-pointer transition-all"
          >
            <div className="flex items-start mb-4">
              <div className="mr-4 mt-1 h-8 w-8 flex items-center justify-center rounded-md bg-blue-100 text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
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
                <h2 className="text-2xl font-semibold text-blue-600 mb-3">
                  Normal Chat
                </h2>
                <p className="text-gray-600 mb-4">
                  Your conversation will be saved in your chat history for
                  future reference.
                </p>
              </div>
            </div>
            <ul className="space-y-3 text-gray-600 ml-12">
              {[
                "Conversation is saved to your account",
                "Access chat history from anywhere",
                "Revisit and continue conversations",
              ].map((item, index) => (
                <li key={index} className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div
            onClick={() => handleModeSelection("private")}
            className="border border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:shadow cursor-pointer transition-all"
          >
            <div className="flex items-start mb-4">
              <div className="mr-4 mt-1 h-8 w-8 flex items-center justify-center rounded-md bg-purple-100 text-purple-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
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
                <h2 className="text-2xl font-semibold text-purple-600 mb-3">
                  Private Chat
                </h2>
                <p className="text-gray-600 mb-4">
                  Your conversation will not be saved after you close the chat.
                </p>
              </div>
            </div>
            <ul className="space-y-3 text-gray-600 ml-12">
              {[
                "No persistent chat history",
                "More privacy for sensitive topics",
                "Not accessible after session ends",
              ].map((item, index) => (
                <li key={index} className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 text-center text-sm text-gray-500">
          <p>You can change your default chat mode in settings.</p>
        </div>
      </div>
    </div>
  );
}
