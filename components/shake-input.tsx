"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ShakeInputHandle, ShakeInputProps } from "@/types";
import { SHAKE_MS, HOLD_MS } from "@/constants";

export type { ShakeInputHandle, ShakeInputProps };

function ShakeInput({
  ref,
  className,
  type,
  reveal,
  onInput,
  ...props
}: ShakeInputProps) {
  const innerRef = React.useRef<HTMLDivElement | null>(null);
  const timerRef = React.useRef<number | null>(null);
  const [state, setState] = React.useState({
    active: false,
    message: "",
  });
  const [visible, setVisible] = React.useState(false);

  const cancel = React.useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setState((s) => (s.active ? { ...s, active: false } : s));
  }, []);

  const trigger = React.useCallback((message: string) => {
    setState({ active: true, message });

    const el = innerRef.current;
    if (el) {
      el.classList.remove("is-shaking");
      void el.offsetWidth;
      el.classList.add("is-shaking");
    }

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setState((s) => ({ ...s, active: false }));
      timerRef.current = null;
    }, SHAKE_MS + HOLD_MS);
  }, []);

  React.useImperativeHandle(ref, () => ({ trigger, cancel }), [
    trigger,
    cancel,
  ]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const inputType = reveal ? (visible ? "text" : "password") : type;

  return (
    <div className={cn("t-input-wrap", state.active && "is-error")}>
      <div ref={innerRef} className="t-input">
        <div className="relative">
          <Input
            {...props}
            type={inputType}
            className={cn(className, reveal && "pr-10")}
            onInput={(event) => {
              cancel();
              onInput?.(event);
            }}
          />
          {reveal ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-lg text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {visible ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          ) : null}
        </div>
      </div>
      <p className="t-error-msg text-xs">{state.message}</p>
    </div>
  );
}

function triggerFieldErrors(
  errors: Record<string, string[] | undefined>,
  refs: Record<string, React.RefObject<ShakeInputHandle | null>>,
) {
  for (const [field, messages] of Object.entries(errors)) {
    const message = messages?.[0];
    if (message) {
      refs[field]?.current?.trigger(message);
    }
  }
}

export { ShakeInput, triggerFieldErrors };
