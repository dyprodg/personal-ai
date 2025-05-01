import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen justify-center items-center p-4">
      <SignUp signInUrl="/sign-in" redirectUrl="/dashboard" />
    </div>
  );
}
