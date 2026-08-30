"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { z } from "zod";

import {
  ShakeInput,
  triggerFieldErrors,
  type ShakeInputHandle,
} from "@/components/shake-input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { registerSchema } from "@/lib/validations/auth";

export function RegisterForm() {
  const router = useRouter();
  const supabase = createClient();
  const nameRef = React.useRef<ShakeInputHandle>(null);
  const emailRef = React.useRef<ShakeInputHandle>(null);
  const passwordRef = React.useRef<ShakeInputHandle>(null);
  const confirmPasswordRef = React.useRef<ShakeInputHandle>(null);
  const [pending, setPending] = React.useState(false);
  const [confirmationEmail, setConfirmationEmail] = React.useState("");

  function handleAuthError(error: { code?: string; message: string }) {
    switch (error.code) {
      case "user_already_exists":
        toast.add({
          type: "error",
          title: "Email already registered",
          description:
            "An account with this email already exists. Please sign in instead.",
        });
        emailRef.current?.trigger("Email already registered.");
        break;

      case "weak_password":
        toast.add({
          type: "error",
          title: "Password too weak",
          description: error.message,
        });
        passwordRef.current?.trigger(error.message);
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
          title: "Could not create your account",
          description: error.message,
        });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const result = registerSchema.safeParse({
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
      confirmPassword: String(data.get("confirm-password") ?? ""),
    });

    if (!result.success) {
      triggerFieldErrors(z.flattenError(result.error).fieldErrors, {
        name: nameRef,
        email: emailRef,
        password: passwordRef,
        confirmPassword: confirmPasswordRef,
      });
      return;
    }

    setPending(true);

    const { data: authData, error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: {
          full_name: result.data.name,
        },
      },
    });

    if (error) {
      handleAuthError(error);
      setPending(false);
      return;
    }

    if (authData.session) {
      toast.add({
        type: "success",
        title: "Account created",
        description: "Welcome to Acme Mind!",
      });

      router.replace("/dashboard");
      router.refresh();
      return;
    }

    setConfirmationEmail(result.data.email);
    setPending(false);

    toast.add({
      type: "success",
      title: "Check your inbox",
      description: "We sent a confirmation link to your email address.",
    });
  }

  if (confirmationEmail) {
    return (
      <FieldGroup className="gap-2 text-center">
        <h2 className="text-xl font-semibold tracking-tight">
          Check your inbox
        </h2>
        <FieldDescription>
          We sent a confirmation link to{" "}
          <span className="font-medium text-foreground">
            {confirmationEmail}
          </span>
          . Confirm your account to sign in.
        </FieldDescription>
      </FieldGroup>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="name">Full name</FieldLabel>
          <ShakeInput
            ref={nameRef}
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Jane Doe"
            className="h-11 rounded-xl bg-muted/50"
          />
        </Field>
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
            autoComplete="new-password"
            reveal
            placeholder="Create a password"
            className="h-11 rounded-xl bg-muted/50"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel>
          <ShakeInput
            ref={confirmPasswordRef}
            id="confirm-password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            reveal
            placeholder="Re-enter your password"
            className="h-11 rounded-xl bg-muted/50"
          />
        </Field>
        <Button
          type="submit"
          size="lg"
          className="h-11 w-full rounded-xl"
          disabled={pending}
        >
          {pending ? "Creating account..." : "Create account"}
        </Button>
      </FieldGroup>
    </form>
  );
}
