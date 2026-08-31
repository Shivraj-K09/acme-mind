"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { updateProfile } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import type { ProfileFormDefaults } from "@/types";

export function ProfileForm({ defaults }: { defaults: ProfileFormDefaults }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    setPending(true);

    const result = await updateProfile({
      fullName: String(data.get("full_name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      bio: String(data.get("bio") ?? ""),
      specialization: String(data.get("specialization") ?? ""),
      experienceYears: Number(data.get("experience_years") ?? 0),
    });

    setPending(false);

    if (result.error) {
      toast.add({
        type: "error",
        title: "Could not save your profile",
        description: result.error,
      });
      return;
    }

    toast.add({
      type: "success",
      title: "Profile saved",
      description: "Your changes are live.",
    });

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FieldGroup className="gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="full_name">Full name</FieldLabel>
            <Input
              id="full_name"
              name="full_name"
              autoComplete="name"
              defaultValue={defaults.fullName}
              className="h-11 rounded-xl bg-muted/50"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              defaultValue={defaults.phone}
              className="h-11 rounded-xl bg-muted/50"
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="specialization">Specialization</FieldLabel>
          <Input
            id="specialization"
            name="specialization"
            defaultValue={defaults.specialization}
            placeholder="General therapy"
            className="h-11 rounded-xl bg-muted/50"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="experience_years">
            Years of experience
          </FieldLabel>
          <Input
            id="experience_years"
            name="experience_years"
            type="number"
            min={0}
            max={60}
            defaultValue={defaults.experienceYears}
            className="h-11 rounded-xl bg-muted/50"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="bio">Bio</FieldLabel>
          <Textarea
            id="bio"
            name="bio"
            rows={4}
            defaultValue={defaults.bio}
            placeholder="Tell clients about your approach..."
            className="rounded-xl bg-muted/50"
          />
        </Field>
        <Button
          type="submit"
          size="lg"
          className="h-11 w-full rounded-xl"
          disabled={pending}
        >
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </FieldGroup>
    </form>
  );
}
