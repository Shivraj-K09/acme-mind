"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export function RespondButtons({
  recommendationId,
}: {
  recommendationId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [pending, setPending] = React.useState<"ACCEPTED" | "REJECTED" | null>(
    null
  );

  async function respond(status: "ACCEPTED" | "REJECTED") {
    setPending(status);

    const { error } = await supabase
      .from("therapist_recommendations")
      .update({ status })
      .eq("id", recommendationId);

    setPending(null);

    if (error) {
      toast.add({
        type: "error",
        title: "Could not respond",
        description: error.message,
      });
      return;
    }

    toast.add({
      type: "success",
      title: status === "ACCEPTED" ? "Therapist accepted" : "Therapist rejected",
      description:
        status === "ACCEPTED"
          ? "You can now view their available slots."
          : "This recommendation was removed from your matches.",
    });

    router.refresh();
  }

  return (
    <div className="flex gap-2.5 w-full">
      <Button
        className="flex-1 rounded-xl h-10 font-medium"
        disabled={pending !== null}
        onClick={() => respond("ACCEPTED")}
      >
        <Check className="size-4 mr-1.5" />
        {pending === "ACCEPTED" ? "Accepting..." : "Accept"}
      </Button>
      <Button
        variant="outline"
        className="flex-1 rounded-xl h-10 font-medium hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
        disabled={pending !== null}
        onClick={() => respond("REJECTED")}
      >
        <X className="size-4 mr-1.5" />
        {pending === "REJECTED" ? "Declining..." : "Decline"}
      </Button>
    </div>
  );
}
