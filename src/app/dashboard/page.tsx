"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getUserStats } from "@/lib/stats";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalChats: 0,
    totalMessages: 0,
    totalTokens: 0,
    dailyMessages: 0,
    dailyTokens: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const userStats = await getUserStats();
        if (userStats) {
          // Ensure all values are numbers, not null
          setStats({
            totalChats: Number(userStats.totalChats || 0),
            totalMessages: Number(userStats.totalMessages || 0),
            totalTokens: Number(userStats.totalTokens || 0),
            dailyMessages: Number(userStats.dailyMessages || 0),
            dailyTokens: Number(userStats.dailyTokens || 0),
          });
        }
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // Format large numbers nicely
  const formatNumber = (num: number | null | undefined): string => {
    const value = Number(num || 0);
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">AI Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Welcome to Your Personal AI
          </h2>
          <p className="text-gray-600 mb-4">
            Your AI assistant is ready to help with your tasks. Start a
            conversation or create a new project.
          </p>
          <div className="flex gap-3">
            <Link
              href="/chat"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                />
              </svg>
              Normal Chat
            </Link>
            <Link
              href="/chat/private"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              Private Chat
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Usage Statistics</h2>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Conversations</p>
                  <p className="text-2xl font-bold">
                    {formatNumber(stats.totalChats)}
                  </p>
                </div>
                <div className="bg-violet-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Messages</p>
                  <p className="text-2xl font-bold">
                    {formatNumber(stats.totalMessages)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Today&apos;s Messages</p>
                  <p className="text-2xl font-bold">
                    {formatNumber(stats.dailyMessages)}
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Tokens</p>
                  <p className="text-2xl font-bold">
                    {formatNumber(stats.totalTokens)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatNumber(stats.dailyTokens)} today
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
