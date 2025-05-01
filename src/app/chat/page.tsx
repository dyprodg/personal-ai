"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createChatHistory } from "@/actions/chat";

export default function ChatPage() {
  const router = useRouter();

  useEffect(() => {
    const createNewChat = async () => {
      try {
        const chatId = await createChatHistory();
        router.push(`/chat/${chatId}`);
      } catch (error) {
        console.error("Failed to create new chat:", error);
      }
    };

    createNewChat();
  }, [router]);

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin mb-4 mx-auto w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
        <p className="text-gray-500">Creating a new chat...</p>
      </div>
    </div>
  );
}
