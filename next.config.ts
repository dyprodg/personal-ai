import type { NextConfig } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const nextConfig: NextConfig = {
  env: {
    CLERK_SIGN_IN_URL: `${BASE_URL}/sign-in`,
    CLERK_SIGN_UP_URL: `${BASE_URL}/sign-up`,
    CLERK_AFTER_SIGN_IN_URL: `${BASE_URL}/dashboard`,
    CLERK_AFTER_SIGN_UP_URL: `${BASE_URL}/`,
  },
};

export default nextConfig;
