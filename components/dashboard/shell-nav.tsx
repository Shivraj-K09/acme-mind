"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ElementType } from "react";
import {
  Users,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Calendar,
  CreditCard,
  User,
  Compass,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";
import { ROUTE_ICONS } from "@/constants";

function getNavIcon(item: NavItem): ElementType {
  if (item.icon) return item.icon;
  if (ROUTE_ICONS[item.href]) return ROUTE_ICONS[item.href];

  const lowerLabel = item.label.toLowerCase();
  if (lowerLabel.includes("client")) return Users;
  if (lowerLabel.includes("therapist")) return HeartHandshake;
  if (lowerLabel.includes("coordinator")) return ShieldCheck;
  if (lowerLabel.includes("recommend")) return Sparkles;
  if (
    lowerLabel.includes("booking") ||
    lowerLabel.includes("session") ||
    lowerLabel.includes("calendar")
  )
    return Calendar;
  if (lowerLabel.includes("payment") || lowerLabel.includes("bill"))
    return CreditCard;
  if (
    lowerLabel.includes("profile") ||
    lowerLabel.includes("account") ||
    lowerLabel.includes("user")
  )
    return User;

  return Compass;
}

export function ShellNav({
  items,
  orientation = "vertical",
  onItemClick,
}: {
  items: NavItem[];
  orientation?: "vertical" | "horizontal";
  onItemClick?: () => void;
}) {
  const pathname = usePathname();

  const activeHref =
    items
      .filter(
        (item) =>
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)),
      )
      .sort((a, b) => b.href.length - a.href.length)[0]?.href ??
    items.find((i) => i.href === pathname)?.href;

  const navItems = items.map((item) => ({
    ...item,
    active: item.href === activeHref,
    Icon: getNavIcon(item),
  }));

  if (orientation === "horizontal") {
    return (
      <nav className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-all duration-200",
              item.active
                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.Icon className="size-3.5 shrink-0" />
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span
                className={cn(
                  "ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                  item.active
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-background text-muted-foreground",
                )}
              >
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onItemClick}
          className={cn(
            "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 select-none",
            item.active
              ? "bg-primary/10 text-primary font-semibold shadow-xs"
              : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
          )}
        >
          {item.active && (
            <span
              className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary"
              aria-hidden="true"
            />
          )}
          <item.Icon
            className={cn(
              "size-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110",
              item.active
                ? "text-primary"
                : "text-muted-foreground/80 group-hover:text-foreground",
            )}
          />
          <span className="truncate">{item.label}</span>
          {item.badge !== undefined && (
            <span
              className={cn(
                "ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold",
                item.active
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground group-hover:bg-background",
              )}
            >
              {item.badge}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
