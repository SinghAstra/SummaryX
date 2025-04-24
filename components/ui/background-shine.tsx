import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BackgroundShineProps {
  children: ReactNode;
  className?: string;
}

export function BackgroundShine({ children, className }: BackgroundShineProps) {
  return (
    <div
      className={cn(
        "items-center justify-center rounded-full border border-white/10 text-neutral-200 px-3 py-1 w-fit",
        "bg-[linear-gradient(110deg,#000103,45%,#303030,55%,#000103)]  bg-[length:400%_100%]",
        "animate-shine",
        className
      )}
    >
      {children}
    </div>
  );
}
