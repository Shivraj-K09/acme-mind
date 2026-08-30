"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/client";
import { setPasswordSchema } from "@/lib/validations/auth";
import { ShakeInput, triggerFieldErrors, type ShakeInputHandle } from "@/components/shake-input";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";

export function SetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();
  const passwordRef = React.useRef<ShakeInputHandle>(null);
  const confirmPasswordRef = React.useRef<ShakeInputHandle>(null);
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const result = setPasswordSchema.safeParse({
      password: String(data.get("password") ?? ""),
      confirmPassword: String(data.get("confirm-password") ?? ""),
    });

    if (!result.success) {
      triggerFieldErrors(z.flattenError(result.error).fieldErrors, {
        password: passwordRef,
        confirmPassword: confirmPasswordRef,
      });
      return;
    }

    setPending(true);

    const { error } = await supabase.auth.updateUser({
      password: result.data.password,
    });

    setPending(false);

    if (error) {
      toast.add({
        type: "error",
        title: "Could not set the password",
        description:
          error.code === "auth_session_missing"
            ? "This link has expired. Please request a new invite or try signing in."
            : error.message,
      });
      return;
    }

    toast.add({
      type: "success",
      title: "Password set",
      description: "Your account is ready. Welcome to Acme Mind!",
    });

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="password">New password</FieldLabel>
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
          {pending ? "Saving..." : "Set password & continue"}
        </Button>
      </FieldGroup>
    </form>
  );
}
