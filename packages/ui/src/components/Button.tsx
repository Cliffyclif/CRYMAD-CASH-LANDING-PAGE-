import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../cn.js";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  children: ReactNode;
}

export function Button({ variant = "primary", className, children, ...rest }: ButtonProps) {
  return (
    <button className={cn(variant === "primary" ? "btn-primary" : "btn-ghost", className)} {...rest}>
      {children}
    </button>
  );
}
