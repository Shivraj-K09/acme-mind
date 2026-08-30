import type { Metadata } from "next";
import Image from "next/image";

import { Vine } from "@/components/vine";

export const metadata: Metadata = {
  title: {
    template: "%s - Acme Mind",
    default: "Acme Mind",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden h-screen overflow-hidden lg:block">
        <Image
          src="/acme-miind.png"
          alt="Acme Mind"
          width={1086}
          height={1448}
          priority
          className="h-full w-full object-cover object-center"
        />
      </div>
      <main className="relative flex items-center justify-center overflow-hidden px-6 py-12 shadow-[-24px_0_48px_-12px_rgba(0,0,0,0.12)] sm:px-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -top-24 right-[-8%] size-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 left-[-6%] size-80 rounded-full bg-primary/5 blur-3xl" />
          <Vine className="absolute -bottom-10 -left-10 size-72 rotate-12 text-primary/35" />
          <Vine className="absolute -right-12 -top-12 size-80 -scale-x-100 text-primary/25" />
        </div>
        <div className="relative w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
