import type { ComponentProps, Ref, RefObject, InputEventHandler } from "react";

export interface SignOutButtonProps {
  variant?: "ghost" | "outline" | "default" | "secondary" | "destructive";
  size?: "default" | "sm" | "xs" | "icon" | "icon-sm" | "icon-xs" | "lg";
  className?: string;
  showText?: boolean;
  iconOnly?: boolean;
}

export type ShakeInputHandle = {
  trigger: (message: string) => void;
  cancel: () => void;
};

export type ShakeInputProps = Omit<
  ComponentProps<"input">,
  "ref" | "onInput"
> & {
  ref?: Ref<ShakeInputHandle>;
  reveal?: boolean;
  onInput?: InputEventHandler<HTMLInputElement>;
};

export type FieldErrorRefs = Record<string, RefObject<ShakeInputHandle | null>>;
