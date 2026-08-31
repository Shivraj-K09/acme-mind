import { cn } from "@/lib/utils";

const LEAF_PATH = "M16 48c0-15 11-27 30-30 2 16-6 32-24 32-2 0-4-.7-6-2z";

export function Logo({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  const light = variant === "light";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-lg",
          light ? "bg-background" : "bg-primary",
        )}
      >
        <svg viewBox="0 0 64 64" className="size-5" aria-hidden="true">
          <path fill={light ? "#1E402B" : "#F5F1E6"} d={LEAF_PATH} />
          <path
            d="M18 46c7-9 16-16 27-21"
            stroke={light ? "#F5F1E6" : "#1E402B"}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </span>
      <span className="font-semibold tracking-tight">Acme Mind</span>
    </span>
  );
}
