import type { Metadata } from "next"
import Link from "next/link"

import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "Sign in",
}

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
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
  )
}
