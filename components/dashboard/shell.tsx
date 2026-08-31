"use client";

import { useState } from "react";
import { Sparkles, Menu } from "lucide-react";
import { ShellNav } from "@/components/dashboard/shell-nav";
import { SignOutButton } from "@/components/sign-out-button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { NavItem, UserProfile } from "@/types";

function getUserInitials(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "AM";
}

function formatRoleName(role?: string | null): string {
  if (!role) return "Member";
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

export function Shell({
  nav,
  children,
  user,
}: {
  nav: NavItem[];
  children: React.ReactNode;
  user?: UserProfile;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = getUserInitials(user?.name, user?.email);
  const roleName = formatRoleName(user?.role);
  const displayName = user?.name || user?.email?.split("@")[0] || "User";

  return (
    <div className="flex min-h-svh bg-background">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-svh w-64 xl:w-70 shrink-0 flex-col border-r border-sidebar-border/80 bg-sidebar/80 backdrop-blur-xl p-4 lg:flex">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs ring-1 ring-primary/30">
            <Sparkles className="size-4.5" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-foreground">
                Acme Mind
              </span>
              <span className="rounded-md bg-primary/10 px-1.5 py-0.2 text-[10px] font-semibold text-primary">
                {roleName}
              </span>
            </div>
            <span className="text-[11px] font-medium text-muted-foreground truncate">
              Care Management
            </span>
          </div>
        </div>

        <div className="my-3 h-px bg-border/60" />

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="mb-2 px-2.5">
            <p className="text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase">
              Menu
            </p>
          </div>
          <ShellNav items={nav} orientation="vertical" />
        </div>

        {/* User Card & Sign Out Footer */}
        <div className="pt-3 border-t border-border/60">
          <div className="flex items-center justify-between rounded-xl bg-card/80 p-2.5 border border-border/60 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary ring-1 ring-primary/25">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">
                  {displayName}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {user?.email || roleName}
                </p>
              </div>
            </div>
            <SignOutButton iconOnly size="icon-sm" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/90 backdrop-blur-md px-4 py-3 lg:hidden">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Open menu"
                  />
                }
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-72 p-4 flex flex-col justify-between"
              >
                <div>
                  <SheetHeader className="p-0 pb-4">
                    <div className="flex items-center gap-3 px-1">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs ring-1 ring-primary/30">
                        <Sparkles className="size-4.5" />
                      </div>
                      <div className="flex flex-col text-left">
                        <SheetTitle className="text-sm font-bold tracking-tight">
                          Acme Mind
                        </SheetTitle>
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {roleName} Workspace
                        </span>
                      </div>
                    </div>
                  </SheetHeader>
                  <div className="mt-2">
                    <ShellNav
                      items={nav}
                      orientation="vertical"
                      onItemClick={() => setMobileOpen(false)}
                    />
                  </div>
                </div>

                {/* Mobile User Profile Footer */}
                <div className="pt-3 border-t border-border/60">
                  <div className="flex items-center justify-between rounded-xl bg-card/80 p-2.5 border border-border/60 shadow-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary ring-1 ring-primary/25">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {displayName}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {roleName}
                        </p>
                      </div>
                    </div>
                    <SignOutButton iconOnly size="icon-sm" />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                <Sparkles className="size-3.5" />
              </div>
              <span className="text-sm font-bold tracking-tight text-foreground">
                Acme Mind
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SignOutButton size="xs" variant="ghost" />
          </div>
        </header>

        {/* Mobile Horizontal Quick Nav */}
        <div className="border-b bg-muted/20 px-4 py-2 lg:hidden">
          <ShellNav items={nav} orientation="horizontal" />
        </div>

        {/* Main page content */}
        <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
