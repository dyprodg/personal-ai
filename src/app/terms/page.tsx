import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Bloomweaver AI Chat",
  description: "Terms of Service for Bloomweaver AI Chat",
};

export default function TermsOfService() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-md p-8 border border-gray-200">
        <h1 className="text-4xl font-bold text-center mb-10 text-blue-500">
          Terms of Service
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
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-blue-600 mb-3">
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-600">
                  By accessing or using our service, you agree to be bound by
                  these Terms of Service. If you do not agree to these terms,
                  please do not use our service.
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
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-blue-600 mb-3">
                  2. Description of Service
                </h2>
                <p className="text-gray-600">
                  Bloomweaver AI Chat is an advanced AI chat platform focused on
                  intelligent conversations. We provide AI-powered chat
                  capabilities for various use cases.
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
                  3. User Accounts
                </h2>
                <p className="text-gray-600">
                  To use certain features of our service, you may need to create
                  an account. You are responsible for maintaining the
                  confidentiality of your account information and for all
                  activities that occur under your account.
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
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-blue-600 mb-3">
                  4. User Content
                </h2>
                <p className="text-gray-600">
                  Messages sent in normal mode are stored to provide
                  functionality. Messages sent in private mode are not stored.
                  You retain ownership of any content you submit through our
                  service.
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
                  <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
                  <path d="M8.5 8.5v.01"></path>
                  <path d="M16 15.5v.01"></path>
                  <path d="M12 12v.01"></path>
                  <path d="M11 17v.01"></path>
                  <path d="M7 14v.01"></path>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-blue-600 mb-3">
                  5. Prohibited Uses
                </h2>
                <p className="text-gray-600 mb-4">
                  You agree not to use our service for any unlawful purpose or
                  in any way that could damage, disable, or impair our service.
                </p>
              </div>
            </div>

            <ul className="space-y-3 text-gray-600 ml-12">
              {[
                "Do not attempt to gain unauthorized access to our systems",
                "Do not use our service to generate harmful or illegal content",
                "Do not interfere with other users' access to the service",
              ].map((item, index) => (
                <li key={index} className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-red-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
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
                  <line x1="8" y1="19" x2="8" y2="21"></line>
                  <line x1="8" y1="13" x2="8" y2="15"></line>
                  <line x1="16" y1="19" x2="16" y2="21"></line>
                  <line x1="16" y1="13" x2="16" y2="15"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="12" y1="15" x2="12" y2="17"></line>
                  <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-blue-600 mb-3">
                  6. Limitation of Liability
                </h2>
                <p className="text-gray-600">
                  Our service is provided &quot;as is&quot; without warranties
                  of any kind. We shall not be liable for any direct, indirect,
                  incidental, special, or consequential damages resulting from
                  the use or inability to use our service.
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
                  <path d="M12 3v12"></path>
                  <path d="m8 11 4 4 4-4"></path>
                  <path d="M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4"></path>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-blue-600 mb-3">
                  7. Changes to Terms
                </h2>
                <p className="text-gray-600">
                  We reserve the right to modify these terms at any time. We
                  will notify users of any significant changes by posting a
                  notice on our website.
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
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="m12 8-4 4 4 4"></path>
                  <path d="m16 12-4-4-4 4 4 4 4-4z"></path>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-blue-600 mb-3">
                  8. Governing Law
                </h2>
                <p className="text-gray-600">
                  These Terms shall be governed by and construed in accordance
                  with applicable laws, without regard to its conflict of law
                  principles.
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
                  9. Contact Information
                </h2>
                <p className="text-gray-600">
                  If you have any questions about these Terms, please contact
                  us.
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
