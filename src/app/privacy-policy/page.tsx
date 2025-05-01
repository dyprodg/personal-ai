import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Bloomweaver AI Chat",
  description: "Privacy Policy for Bloomweaver AI Chat",
};

export default function PrivacyPolicy() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-md p-8 border border-gray-200">
        <h1 className="text-4xl font-bold text-center mb-10 text-blue-500">
          Privacy Policy
        </h1>

        <div className="space-y-8">
          <section className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all">
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
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-blue-600 mb-3">
                  Overview
                </h2>
                <p className="text-gray-600">
                  This Privacy Policy explains how we collect, use, and protect
                  your information when you use our service.
                </p>
              </div>
            </div>
          </section>

          <section className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all">
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-blue-600 mb-3">
                  Information We Collect
                </h2>
              </div>
            </div>

            <ul className="space-y-4 ml-12">
              <li className="border border-gray-100 rounded-lg p-4 bg-blue-50">
                <span className="font-medium text-blue-600 block mb-1">
                  Normal Mode Chats
                </span>
                <p className="text-gray-600">
                  Messages you send in normal mode are stored to provide chat
                  history functionality.
                </p>
              </li>
              <li className="border border-gray-100 rounded-lg p-4 bg-blue-50">
                <span className="font-medium text-blue-600 block mb-1">
                  Private Chats
                </span>
                <p className="text-gray-600">
                  Messages sent in private mode are not stored anywhere.
                </p>
              </li>
              <li className="border border-gray-100 rounded-lg p-4 bg-blue-50">
                <span className="font-medium text-blue-600 block mb-1">
                  Usage Data
                </span>
                <p className="text-gray-600">
                  We collect basic usage data (such as session duration and
                  feature usage) without storing the actual content of your
                  conversations.
                </p>
              </li>
              <li className="border border-gray-100 rounded-lg p-4 bg-blue-50">
                <span className="font-medium text-blue-600 block mb-1">
                  User Authentication
                </span>
                <p className="text-gray-600">
                  User authentication is handled by Clerk. We only store your
                  user ID for technical purposes.
                </p>
              </li>
            </ul>
          </section>

          <section className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all">
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
                  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-blue-600 mb-3">
                  Cookies
                </h2>
                <p className="text-gray-600">
                  This website does not use cookies for tracking or analytics
                  purposes.
                </p>
              </div>
            </div>
          </section>

          <section className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all">
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
                  <path d="M12 20V10" />
                  <path d="m18 20-6-6-6 6" />
                  <path d="M9 4h6" />
                  <path d="M10 7h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-blue-600 mb-3">
                  How We Use Your Information
                </h2>
              </div>
            </div>

            <ul className="space-y-3 text-gray-600 ml-12">
              {[
                "To provide and maintain our service",
                "To improve and personalize your experience",
                "To analyze usage patterns and optimize our service",
              ].map((item, index) => (
                <li key={index} className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-blue-500"
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
          </section>

          <section className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all">
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
                <h2 className="text-2xl font-semibold text-blue-600 mb-3">
                  Data Security
                </h2>
                <p className="text-gray-600">
                  We implement appropriate security measures to protect your
                  personal information. Private chats are not stored, and normal
                  chat data is secured with industry-standard protections.
                </p>
              </div>
            </div>
          </section>

          <section className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all">
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
                  <path d="M12 3v12" />
                  <path d="m8 11 4 4 4-4" />
                  <path d="M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-blue-600 mb-3">
                  Changes to This Policy
                </h2>
                <p className="text-gray-600">
                  We may update our Privacy Policy from time to time. We will
                  notify you of any changes by posting the new Privacy Policy on
                  this page.
                </p>
              </div>
            </div>
          </section>

          <section className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all">
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
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-blue-600 mb-3">
                  Contact Us
                </h2>
                <p className="text-gray-600">
                  If you have any questions about this Privacy Policy, please
                  contact us.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
