"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";

import { CreateClientForm } from "@/components/dashboard/coordinator/create-client-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CreateClientDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  function handleSuccess(userId?: string) {
    setOpen(false);

    if (userId) {
      router.push(`/dashboard/clients/${userId}`);
      return;
    }

    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="lg" className="h-11 rounded-xl">
            <PlusIcon data-icon="inline-start" /> New client
          </Button>
        }
      />
      <DialogContent className="gap-5 p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Create client
          </DialogTitle>
          <DialogDescription>
            The client receives an email invite to set their own password. You
            can recommend therapists right away.
          </DialogDescription>
        </DialogHeader>
        <CreateClientForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
