import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen justify-center items-center p-4">
      <SignIn signUpUrl="/sign-up" redirectUrl="/dashboard" />
    </div>
  );
}
