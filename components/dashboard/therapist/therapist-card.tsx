"use client";

import { Award, CheckCircle2, HeartHandshake, Sparkles, Video, Mail, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { TherapistCardProps } from "@/types";

export function getTherapistInitials(name: string | null | undefined): string {
  if (!name) return "DR";
  const cleaned = name.replace(/^(dr\.?|mr\.?|mrs\.?|ms\.?)\s+/i, "");
  return (
    cleaned
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "DR"
  );
}

export function TherapistCard({
  name,
  specialization,
  experienceYears,
  bio,
  email,
  phone,
  statusBadge,
  actions,
  availableSlotsCount,
  className,
  compact = false,
}: TherapistCardProps) {
  const initials = getTherapistInitials(name);
  const specText = specialization?.trim() || "General Clinical Therapy";
  const expYears = experienceYears ?? 0;

  return (
    <Card
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card/90 shadow-xs transition-all duration-300 hover:border-primary/40 hover:shadow-md",
        className
      )}
    >
      {/* Subtle top decorative gradient line */}
      <div className="h-1.5 w-full bg-linear-to-r from-primary/60 via-primary/30 to-primary/10" />

      <CardContent className="flex flex-1 flex-col p-5">
        {/* Header section with Doctor Avatar and Details */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            {/* Doctor Avatar with Ring & Verified Badge */}
            <div className="relative shrink-0">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 via-primary/10 to-primary/5 text-sm font-bold text-primary ring-2 ring-primary/25 shadow-xs transition-transform duration-200 group-hover:scale-105">
                {initials}
              </div>
              <div
                className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs ring-2 ring-card"
                title="Verified Specialist"
              >
                <CheckCircle2 className="size-3.5" />
              </div>
            </div>

            {/* Doctor Title & Specialization */}
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold tracking-tight text-foreground line-clamp-1">
                {name}
              </h3>
              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  <HeartHandshake className="size-3.5 shrink-0" />
                  <span>{specText}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Optional status badge */}
          {statusBadge && <div className="shrink-0">{statusBadge}</div>}
        </div>

        {/* Highlights Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <div className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/40 px-2.5 py-1 text-muted-foreground">
            <Award className="size-3.5 text-primary" />
            <span>
              <strong className="font-semibold text-foreground">{expYears}</strong> {expYears === 1 ? "yr" : "yrs"} experience
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/40 px-2.5 py-1 text-muted-foreground">
            <Video className="size-3.5 text-primary" />
            <span>Virtual Care</span>
          </div>

          {availableSlotsCount !== undefined && availableSlotsCount > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-emerald-700 dark:text-emerald-300 font-medium">
              <Sparkles className="size-3.5 text-emerald-600" />
              <span>{availableSlotsCount} {availableSlotsCount === 1 ? "slot" : "slots"} available</span>
            </div>
          )}
        </div>

        {/* Bio quote section */}
        {bio ? (
          <p
            className={cn(
              "mt-3.5 text-sm leading-relaxed text-muted-foreground",
              compact ? "line-clamp-2" : "line-clamp-3"
            )}
          >
            &ldquo;{bio}&rdquo;
          </p>
        ) : (
          <p className="mt-3.5 text-sm italic text-muted-foreground/80">
            Specialized mental health care professional committed to evidence-based wellness.
          </p>
        )}

        {/* Contact Info (if available, e.g. for directory) */}
        {(email || phone) && (
          <div className="mt-3.5 flex flex-col gap-1 border-t border-border/50 pt-3 text-xs text-muted-foreground">
            {email && (
              <div className="flex items-center gap-2 truncate">
                <Mail className="size-3.5 text-primary shrink-0" />
                <span className="truncate">{email}</span>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-2 truncate">
                <Phone className="size-3.5 text-primary shrink-0" />
                <span className="truncate">{phone}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons Footer */}
        {actions && (
          <div className="mt-4 border-t border-border/60 pt-3.5">
            {actions}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
