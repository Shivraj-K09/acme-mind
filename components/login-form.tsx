"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { z } from "zod";
import { checkEmailExists } from "@/app/actions/auth";
import { ShakeInput, triggerFieldErrors } from "@/components/shake-input";
import type { ShakeInputHandle } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validations/auth";

export function LoginForm() {
  const router = useRouter();
  const emailRef = React.useRef<ShakeInputHandle>(null);
  const passwordRef = React.useRef<ShakeInputHandle>(null);
  const [pending, setPending] = React.useState(false);

  async function handleAuthError(
    error: { code?: string; message: string },
    email: string,
  ) {
    switch (error.code) {
      case "invalid_credentials": {
        const accountExists = await checkEmailExists(email);

        if (!accountExists) {
          toast.add({
            type: "error",
            title: "Account not found",
            description:
              "No account exists with this email address. Please register first.",
          });
          emailRef.current?.trigger("No account found with this email.");
        } else {
          toast.add({
            type: "error",
            title: "Incorrect password",
            description: "The password you entered is incorrect.",
          });
          passwordRef.current?.trigger("Incorrect password.");
        }
        break;
      }

      case "email_not_confirmed":
        toast.add({
          type: "warning",
          title: "Email not confirmed",
          description: "Please confirm your email address before signing in.",
        });
        emailRef.current?.trigger("Please confirm your email first.");
        break;

      case "user_banned":
        toast.add({
          type: "error",
          title: "Account disabled",
          description:
            "This account has been disabled. Please contact support.",
        });
        break;

      case "over_request_rate_limit":
        toast.add({
          type: "warning",
          title: "Too many attempts",
          description: "Please wait a moment before trying again.",
        });
        break;

      case "fetch_error":
      case "request_timeout":
        toast.add({
          type: "error",
          title: "Connection problem",
          description:
            "We could not reach the server. Please check your internet connection and try again.",
        });
        break;

      default:
        toast.add({
          type: "error",
          title: "Sign-in failed",
          description: error.message,
        });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const result = loginSchema.safeParse({
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
    });

    if (!result.success) {
      triggerFieldErrors(z.flattenError(result.error).fieldErrors, {
        email: emailRef,
        password: passwordRef,
      });
      return;
    }

    const remember = data.get("remember") === "on";

    setPending(true);

    const supabase = createClient(remember);

    const { error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });

    if (error) {
      await handleAuthError(error, result.data.email);
      setPending(false);
      return;
    }

    toast.add({
      type: "success",
      title: "Signed in",
      description: "Welcome back!",
    });

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <ShakeInput
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="h-11 rounded-xl bg-muted/50"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <ShakeInput
            ref={passwordRef}
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            reveal
            placeholder="Enter your password"
            className="h-11 rounded-xl bg-muted/50"
          />
        </Field>
        <div className="flex items-center justify-between">
          <label className="flex w-fit items-center gap-2 text-sm text-muted-foreground">
            <Checkbox name="remember" defaultChecked /> Remember me
          </label>
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-11 w-full rounded-xl"
          disabled={pending}
        >
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </FieldGroup>
    </form>
  );
}
