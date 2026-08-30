"use client";

import * as React from "react";
import { z } from "zod";

import { inviteClient } from "@/app/actions/coordinator";
import { createClientSchema } from "@/lib/validations/coordinator";
import {
  ShakeInput,
  triggerFieldErrors,
  type ShakeInputHandle,
} from "@/components/shake-input";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";

export function CreateClientForm({
  onSuccess,
}: {
  onSuccess: (userId?: string) => void;
}) {
  const nameRef = React.useRef<ShakeInputHandle>(null);
  const emailRef = React.useRef<ShakeInputHandle>(null);
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const result = createClientSchema.safeParse({
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
    });

    if (!result.success) {
      triggerFieldErrors(z.flattenError(result.error).fieldErrors, {
        name: nameRef,
        email: emailRef,
      });
      return;
    }

    setPending(true);

    const response = await inviteClient(result.data);

    setPending(false);

    if (response.error) {
      const alreadyExists = response.error
        .toLowerCase()
        .includes("already exists");

      if (alreadyExists) {
        emailRef.current?.trigger("An account with this email already exists.");
      } else {
        emailRef.current?.trigger(response.error);
      }

      toast.add({
        type: "error",
        title: "Could not create the client",
        description: response.error,
      });
      return;
    }

    toast.add({
      type: "success",
      title: "Invite sent",
      description: `${result.data.name} will receive an email to set their password.`,
    });

    onSuccess(response.userId);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FieldGroup className="gap-5">
        <Field>
          <FieldLabel htmlFor="create-client-name">Client name</FieldLabel>
          <ShakeInput
            ref={nameRef}
            id="create-client-name"
            name="name"
            autoComplete="name"
            placeholder="Jane Doe"
            className="h-11 rounded-xl bg-muted/50"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="create-client-email">Client email</FieldLabel>
          <ShakeInput
            ref={emailRef}
            id="create-client-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="h-11 rounded-xl bg-muted/50"
          />
        </Field>
        <Button
          type="submit"
          size="lg"
          className="h-11 w-full rounded-xl"
          disabled={pending}
        >
          {pending ? "Creating account…" : "Create account & send invite"}
        </Button>
      </FieldGroup>
    </form>
  );
}
