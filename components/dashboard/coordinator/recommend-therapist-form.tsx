"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { recommendTherapist } from "@/app/actions/coordinator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

type TherapistOption = {
  id: string;
  label: string;
};

export function RecommendTherapistForm({
  clientId,
  therapists,
}: {
  clientId: string;
  therapists: TherapistOption[];
}) {
  const router = useRouter();
  const [therapistId, setTherapistId] = React.useState("");
  const [selectKey, setSelectKey] = React.useState(0);
  const [pending, setPending] = React.useState(false);

  if (therapists.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No therapists are available to recommend right now. Therapist profiles
        are created when a user is promoted to the THERAPIST role.
      </p>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!therapistId) {
      return;
    }

    setPending(true);

    const result = await recommendTherapist({ clientId, therapistId });

    setPending(false);

    if (result.error) {
      toast.add({
        type: "error",
        title: "Could not recommend",
        description: result.error,
      });
      return;
    }

    toast.add({
      type: "success",
      title: "Therapist recommended",
      description: "The client can now see this therapist.",
    });

    setTherapistId("");
    setSelectKey((key) => key + 1);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Select
        key={selectKey}
        value={therapistId}
        onValueChange={(value) => setTherapistId((value as string) ?? "")}
      >
        <SelectTrigger className="h-11 flex-1 rounded-xl bg-muted/50 px-3 py-0">
          {therapistId ? (
            therapists.find((therapist) => therapist.id === therapistId)
              ?.label
          ) : (
            <span className="text-muted-foreground">Choose a therapist...</span>
          )}
        </SelectTrigger>
        <SelectContent>
          {therapists.map((therapist) => (
            <SelectItem key={therapist.id} value={therapist.id}>
              {therapist.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="submit"
        size="lg"
        className="h-11 rounded-xl"
        disabled={pending || !therapistId}
      >
        {pending ? "Recommending..." : "Recommend"}
      </Button>
    </form>
  );
}
