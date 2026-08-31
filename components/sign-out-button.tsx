import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SignOutButtonProps } from "@/types";

export function SignOutButton({
  variant = "ghost",
  size = "sm",
  className,
  showText = true,
  iconOnly = false,
}: SignOutButtonProps) {
  return (
    <form action={signOut} className="inline-flex">
      <Button
        type="submit"
        variant={variant}
        size={iconOnly ? "icon-sm" : size}
        title="Sign out"
        aria-label="Sign out"
        className={cn(
          "cursor-pointer transition-colors",
          iconOnly && "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
          !iconOnly && "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
          className
        )}
      >
        <LogOut className={cn("size-4 shrink-0", !iconOnly && showText && "mr-1.5")} />
        {!iconOnly && showText && <span>Sign out</span>}
      </Button>
    </form>
  );
}
