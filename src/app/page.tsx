import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6 text-center">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 text-transparent bg-clip-text">
            Bloomweaver
          </span>
          <span className="text-black"> AI Chat</span>
        </h1>
        <p className="text-xl mb-10 text-gray-600 max-w-lg mx-auto">
          Advanced AI chat platform for intelligent conversations, powered by{" "}
          <span className="text-blue-600 font-semibold">Bloomweaver.</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/sign-up"
            className="px-8 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors duration-200 shadow-lg"
          >
            Start Chatting
          </Link>

          <Link
            href="/sign-in"
            className="px-8 py-3 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
