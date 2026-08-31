import type { ElementType } from "react";

export type NavItem = {
  label: string;
  href: string;
  icon?: ElementType;
  badge?: string | number;
};
