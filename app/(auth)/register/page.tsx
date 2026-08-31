import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/components/register-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">
        Create your account
      </h1>
      <div className="mt-8">
        <RegisterForm />
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
