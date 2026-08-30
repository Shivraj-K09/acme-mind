"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

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
    <div className="flex gap-2">
      <Button
        className="flex-1 rounded-lg"
        disabled={pending !== null}
        onClick={() => respond("ACCEPTED")}
      >
        Accept
      </Button>
      <Button
        variant="outline"
        className="flex-1 rounded-lg"
        disabled={pending !== null}
        onClick={() => respond("REJECTED")}
      >
        Reject
      </Button>
    </div>
  );
}
