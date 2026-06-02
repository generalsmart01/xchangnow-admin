"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "./input";
import { cn } from "@/lib/utils";

/**
 * Password field with a show/hide toggle. Drop-in for `<Input type="password">`
 * — forwards all input props (incl. the ref from react-hook-form's register).
 */
function PasswordInput({ className, ...props }: React.ComponentProps<"input">) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <Input
        {...props}
        type={show ? "text" : "password"}
        className={cn("pr-9", className)}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 grid w-9 place-items-center text-muted-foreground transition-colors hover:text-foreground"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export { PasswordInput };
