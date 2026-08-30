import type { Metadata } from "next";

import { SetPasswordForm } from "@/components/set-password-form";

export const metadata: Metadata = {
  title: "Set password",
};

export default function SetPasswordPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Set your password</h1>
      <div className="mt-8">
        <SetPasswordForm />
      </div>
    </div>
  );
}
