import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/login-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LOGIN_ERRORS } from "@/constants";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const knownError = error ? LOGIN_ERRORS[error] : undefined;

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
      {knownError ? (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>{knownError.title}</AlertTitle>
          <AlertDescription>{knownError.description}</AlertDescription>
        </Alert>
      ) : null}
      <div className="mt-8">
        <LoginForm />
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
