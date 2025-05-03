"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  getChatHistories,
  createChatHistory,
  renameChatHistory,
  deleteChatHistory,
} from "@/actions/chat";
import { ChatHistoryPreview } from "@/types/chat";
import UsageDisplay from "./UsageDisplay";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [chats, setChats] = useState<ChatHistoryPreview[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  const isPrivateMode = pathname === "/chat/private";

  // Load chat histories
  useEffect(() => {
    const loadChats = async () => {
      setIsLoading(true);
      try {
        const histories = await getChatHistories();
        setChats(histories);
      } catch (error) {
        console.error("Failed to load chat histories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, []);

  // Create a new chat history
  const handleNewChat = async () => {
    try {
      const chatId = await createChatHistory();
      router.push(`/chat/${chatId}`);
      // Refresh the chat list
      const histories = await getChatHistories();
      setChats(histories);
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  // Start editing a chat title
  const handleEdit = (chat: ChatHistoryPreview) => {
    setEditingId(chat.id);
    setNewTitle(chat.title);
  };

  // Rename a chat
  const handleRename = async (chatId: string) => {
    if (!newTitle.trim()) return;

    try {
      await renameChatHistory(chatId, newTitle);
      // Refresh the chat list
      const histories = await getChatHistories();
      setChats(histories);
      setEditingId(null);
    } catch (error) {
      console.error("Failed to rename chat:", error);
    }
  };

  // Show delete confirmation dialog
  const showDeleteConfirmation = (chatId: string) => {
    setChatToDelete(chatId);
    setShowDeleteConfirm(true);
  };

  // Delete a chat
  const handleDelete = async () => {
    if (!chatToDelete) return;

    try {
      await deleteChatHistory(chatToDelete);
      // Refresh the chat list
      const histories = await getChatHistories();
      setChats(histories);

      // Redirect to main chat page if the current chat was deleted
      if (pathname === `/chat/${chatToDelete}`) {
        router.push("/chat");
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    } finally {
      setShowDeleteConfirm(false);
      setChatToDelete(null);
    }
  };

  // Go to chat selection page
  const handleSelectMode = () => {
    router.push("/chat");
  };

  // Start a new private chat
  const handlePrivateChat = () => {
    router.push("/chat/private");
  };

  return (
    <div className="h-full fixed left-0 top-0 z-30">
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-transparent bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm mx-4 animate-fadeIn">
            <h3 className="text-lg font-medium mb-3">Delete Conversation</h3>
            <p className="text-gray-600 mb-5">
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 rounded-md text-white hover:bg-red-700 transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`bg-white border-r shadow-sm h-full ${
          isOpen ? "w-64" : "w-0"
        } transition-all duration-300 flex flex-col`}
      >
        {isOpen ? (
          <>
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold">Conversations</h2>
              <div className="flex gap-1">
                {/* Chat mode selection button */}
                <button
                  onClick={handleSelectMode}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                  title="Chat Mode Selection"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3"
                    />
                  </svg>
                </button>

                {/* Normal new chat button */}
                <button
                  onClick={handleNewChat}
                  className="p-1 rounded-full hover:bg-gray-100 text-blue-600"
                  title="New Normal Chat"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </button>

                {/* Private chat button */}
                <button
                  onClick={handlePrivateChat}
                  className={`p-1 rounded-full hover:bg-purple-100 ${
                    isPrivateMode
                      ? "bg-purple-100 text-purple-600"
                      : "text-purple-600"
                  }`}
                  title="New Private Chat"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Private mode indicator */}
            {isPrivateMode && (
              <div className="bg-purple-50 p-2 text-center border-b border-purple-200">
                <div className="flex items-center justify-center text-sm text-purple-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 mr-1"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Private Mode Active
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-2">
              {isLoading ? (
                <div className="text-gray-500 text-sm p-2 flex justify-center">
                  Loading...
                </div>
              ) : chats.length === 0 ? (
                <div className="text-gray-500 text-sm p-2">
                  No conversations yet
                </div>
              ) : (
                <ul className="space-y-1">
                  {chats.map((chat) => (
                    <li key={chat.id} className="relative group">
                      {editingId === chat.id ? (
                        <div className="flex items-center p-2 rounded-md bg-gray-100">
                          <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="flex-1 bg-transparent border-b border-blue-500 focus:outline-none text-sm"
                            autoFocus
                            onBlur={() => handleRename(chat.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRename(chat.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                          />
                          <button
                            onClick={() => handleRename(chat.id)}
                            className="ml-2 text-blue-600"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m4.5 12.75 6 6 9-13.5"
                              />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <Link
                          href={`/chat/${chat.id}`}
                          className={`block p-2 rounded-md hover:bg-gray-100 truncate pr-16 ${
                            pathname === `/chat/${chat.id}`
                              ? "bg-blue-50 text-blue-700"
                              : ""
                          }`}
                        >
                          <div className="font-medium text-sm truncate">
                            {chat.title}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {chat.lastMessage}
                          </div>
                        </Link>
                      )}

                      {editingId !== chat.id && (
                        <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 flex space-x-1">
                          <button
                            onClick={() => handleEdit(chat)}
                            className="p-1 rounded hover:bg-gray-200 text-gray-500"
                            title="Rename"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-3 h-3"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => showDeleteConfirmation(chat.id)}
                            className="p-1 rounded hover:bg-gray-200 text-gray-500"
                            title="Delete"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-3 h-3"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Usage display at the bottom with debug info */}
            <div className="border-t p-3 bg-gray-50">
              <UsageDisplay />
            </div>
          </>
        ) : null}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white rounded-r-md p-1 hover:bg-blue-700 transition-colors"
        >
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
