import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex min-h-screen items-center justify-center p-6 ${inter.className}`}
    >
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg">
        {children}
      </div>
    </div>
  );
}
