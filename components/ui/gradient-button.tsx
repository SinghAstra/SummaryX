import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "lucide-react";
import React, { ReactNode } from "react";

const roundedVariants = {
  full: "rounded-full",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  none: "rounded-none",
} as const;

type RoundedVariant = keyof typeof roundedVariants;

interface GradientActionButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  rounded?: RoundedVariant;
}

const GradientButton = ({
  children,
  onClick,
  className,
  rounded = "full",
}: GradientActionButtonProps) => {
  return (
    <button
      className={cn(
        `group relative grid overflow-hidden ${roundedVariants[rounded]} px-4 py-1 
        shadow-[0_1000px_0_0_hsl(0_0%_20%)_inset] 
        transition-colors duration-200 `,
        className
      )}
      onClick={onClick}
    >
      {/* Background Backdrop Layer */}
      <span
        className={cn(
          "backdrop absolute inset-[1px] transition-colors duration-200 bg-neutral-950 group-hover:bg-neutral-900",
          roundedVariants[rounded]
        )}
      />

      {/* Subtle Gradient Blur Effect */}
      <span
        className={cn(
          "h-full w-full blur-md absolute bottom-0 inset-x-0 bg-gradient-to-tr from-primary/20",
          roundedVariants[rounded]
        )}
      />

      {/* Button Text and Icon Layer */}
      <span
        className="z-10 py-0.5 text-sm text-neutral-100 
          flex items-center justify-center gap-1"
      >
        {children}
        <ArrowRightIcon
          className="ml-1 size-3 transition-transform duration-300 
            ease-in-out group-hover:translate-x-1"
        />
      </span>
    </button>
  );
};

export default GradientButton;
