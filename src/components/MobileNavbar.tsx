"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";

export default function MobileNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center px-2 py-1 h-14">
        {/* Logo with text */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center">
            <Image
              src="/bloomweaver_logo.svg"
              alt="Bloomweaver"
              width={32}
              height={32}
              priority
            />
          </Link>
          <span className="text-blue-600">Bloomweaver</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Auth buttons always visible */}
          <SignedIn>
            <UserButton />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-2 py-1 text-xs font-medium border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>

          {/* Hamburger button */}
          <button
            className="p-1 rounded hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
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
              {isMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Dropdown menu - only legal links */}
      {isMenuOpen && (
        <div className="fixed left-0 right-0 top-14 bg-white p-2 border-b border-gray-200 shadow-md z-50 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          <div className="flex flex-col gap-2">
            {/* Legal links */}
            <div className="flex flex-col gap-1">
              <Link
                href="/terms"
                className="px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy-policy"
                className="px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Privacy Policy
              </Link>
            </div>

            {/* Navigation links only for signed in users */}
            <SignedIn>
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-100">
                <Link
                  href="/chat"
                  className="w-full text-left px-2 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Chat Now
                </Link>
                <Link
                  href="/dashboard"
                  className="w-full text-left px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </div>
            </SignedIn>
          </div>
        </div>
      )}
    </>
  );
}
