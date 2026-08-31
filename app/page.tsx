import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarCheck,
  HeartHandshake,
  ShieldCheck,
  Star,
} from "lucide-react";

import { Vine } from "@/components/vine";
import { Button } from "@/components/ui/button";

const SERIF = "[font-family:var(--font-fraunces)]";

const STEPS = [
  {
    number: "01",
    title: "Talk to a coordinator",
    description:
      "Share what you are going through in a relaxed conversation. No forms, no waiting rooms.",
  },
  {
    number: "02",
    title: "Meet your match",
    description:
      "Your coordinator recommends the therapist that fits your needs and preferences.",
  },
  {
    number: "03",
    title: "Book your first session",
    description:
      "Choose a time from their availability and start feeling better.",
  },
];

const THERAPISTS = [
  {
    name: "Dr. Sarah Miller",
    focus: "Anxiety & stress",
    experience: "8 years",
  },
  {
    name: "Dr. James Chen",
    focus: "Relationships",
    experience: "12 years",
  },
  {
    name: "Dr. Priya Sharma",
    focus: "Trauma & PTSD",
    experience: "10 years",
  },
];

function LeafMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 48c0-15 11-27 30-30 2 16-6 32-24 32-2 0-4-.7-6-2z"
      />
      <path
        d="M18 46c7-9 16-16 27-21"
        stroke="var(--background)"
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="fixed inset-x-0 top-0 z-30 h-16 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 text-xl ${SERIF}`}
          >
            <LeafMark className="size-7 text-primary" />
            Acme Mind
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <Link
              href="#how"
              className="transition-colors hover:text-foreground"
            >
              How it works
            </Link>
            <Link
              href="#therapists"
              className="transition-colors hover:text-foreground"
            >
              Therapists
            </Link>
            <Link
              href="#care"
              className="transition-colors hover:text-foreground"
            >
              Why Acme Mind
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="h-9 rounded-full px-4"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              Sign in
            </Button>
            <Button
              className="h-9 rounded-full px-5"
              nativeButton={false}
              render={<Link href="/register" />}
            >
              Get started
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <Vine className="absolute -left-10 top-24 size-72 -scale-x-100 text-primary/10" />
            <Vine className="absolute -right-8 top-72 size-72 rotate-12 text-primary/10" />
          </div>

          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-16 px-6 pb-28 pt-16 lg:grid-cols-2 lg:pt-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                Therapy, personally matched
              </p>
              <h1
                className={`mt-5 text-6xl font-medium leading-[1.02] tracking-tight sm:text-7xl ${SERIF}`}
              >
                Feel like <em className="italic text-primary">yourself</em>{" "}
                again.
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
                One relaxed conversation with our coordinator and you are
                matched with the therapist who truly fits.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  className="h-12 rounded-full px-8"
                  nativeButton={false}
                  render={<Link href="/register" />}
                >
                  Get started <ArrowRight className="size-4" />
                </Button>
                <Link
                  href="#how"
                  className="flex h-12 items-center rounded-full px-6 text-sm font-medium transition-colors hover:bg-muted"
                >
                  How it works
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="size-4 text-primary" /> Licensed
                  therapists
                </span>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarCheck className="size-4 text-primary" /> Free
                  cancellation
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div
                aria-hidden="true"
                className="absolute -inset-10 rounded-full bg-secondary/40 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="absolute -inset-4 -rotate-2 rounded-[3rem] border border-primary/10 bg-secondary/60"
              />
              <div className="relative rounded-t-[10rem] rounded-b-[2rem] bg-card p-3 shadow-2xl ring-1 ring-foreground/10">
                <div className="relative aspect-[3/4] overflow-hidden rounded-t-[9rem]">
                  <Image
                    src="/landing_page.png"
                    alt="A calm therapy space at Acme Mind"
                    fill
                    priority
                    sizes="(min-width: 1024px) 420px, 90vw"
                    className="object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-linear-to-t from-primary/25 via-transparent to-transparent"
                  />
                </div>
                <div className="absolute -bottom-8 -left-10 flex items-center gap-3 rounded-2xl bg-primary p-4 text-primary-foreground shadow-2xl">
                  <div className="flex size-11 items-center justify-center rounded-full bg-background/20">
                    <HeartHandshake className="size-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      Matched with Dr. Taylor
                    </p>
                    <div className="mt-0.5 flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className="size-3 fill-amber-300 text-amber-300"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute -right-6 top-14 flex items-center gap-3 rounded-2xl border border-foreground/5 bg-card p-3 shadow-xl">
                  <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CalendarCheck className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Next available
                    </p>
                    <p className="text-sm font-semibold">Today, 5:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto w-full max-w-6xl px-6 py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            How it works
          </p>
          <h2
            className={`mt-4 max-w-xl text-4xl font-medium leading-tight tracking-tight sm:text-5xl ${SERIF}`}
          >
            Simple, human, and built around you
          </h2>

          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="border-t-2 border-primary/20 pt-6"
              >
                <span
                  className={`text-5xl font-medium italic text-primary/30 ${SERIF}`}
                >
                  {step.number}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="therapists" className="border-y bg-secondary/40">
          <div className="mx-auto w-full max-w-6xl px-6 py-28">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <h2
                className={`max-w-md text-4xl font-medium leading-tight tracking-tight sm:text-5xl ${SERIF}`}
              >
                Therapists who truly listen
              </h2>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                Vetted, experienced, and personally matched to you by our care
                coordination team.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {THERAPISTS.map((therapist) => (
                <div
                  key={therapist.name}
                  className="flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-foreground/5"
                >
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {therapist.name
                      .replace("Dr. ", "")
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </div>
                  <p className={`text-xl ${SERIF}`}>{therapist.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {therapist.focus} · {therapist.experience}
                  </p>
                  <span className="flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    <ShieldCheck className="size-3.5" /> Vetted
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-28 pt-28">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-primary px-6 py-24 text-center text-primary-foreground">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
            >
              <Vine className="absolute -left-10 -top-10 size-72 -scale-x-100 text-background/10" />
              <Vine className="absolute -bottom-12 -right-12 size-80 rotate-12 text-background/10" />
            </div>
            <p className="relative text-xs font-semibold uppercase tracking-[0.25em] opacity-70">
              Why Acme Mind
            </p>
            <blockquote
              className={`relative mx-auto mt-5 max-w-2xl text-4xl font-medium leading-tight tracking-tight text-balance sm:text-5xl ${SERIF}`}
            >
              &ldquo;You matter. Your mind matters.&rdquo;
            </blockquote>
            <p className="relative mx-auto mt-6 max-w-md text-sm leading-relaxed opacity-80">
              Every therapist in our network is vetted and experienced, and
              every match is made personally - never left to an algorithm.
            </p>
            <Button
              size="lg"
              className="relative mt-10 h-12 rounded-full bg-background px-8 text-foreground hover:bg-background/90"
              nativeButton={false}
              render={<Link href="/register" />}
            >
              Get started <ArrowRight className="size-4" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <span className={`inline-flex items-center gap-2 text-lg ${SERIF}`}>
            <LeafMark className="size-6 text-primary" />
            Acme Mind
          </span>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Acme Mind. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
