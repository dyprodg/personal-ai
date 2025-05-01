import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import LegalLinksDropdown from "./LegalLinksDropdown";

export default function Navbar() {
  return (
    <header className="flex justify-between items-center p-4 gap-4 h-16 border-b bg-white">
      <Link href="/" className="text-xl font-semibold flex items-center gap-2">
        <span className="text-blue-600">Dyprodg.</span>
        <span>Personal AI</span>
      </Link>

      <div className="flex gap-4 items-center">
        <LegalLinksDropdown />
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Dashboard
          </Link>
          <Link
            href="/chat"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Chat
          </Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </header>
  );
}
