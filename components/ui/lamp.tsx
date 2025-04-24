"use client";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import React, { ReactNode } from "react";

interface LampContainerProps {
  children: ReactNode;
  className?: string;
}

export const LampContainer = ({ children, className }: LampContainerProps) => {
  return (
    <div
      className={cn(
        "relative flex min-h-screen pt-12 overflow-hidden w-full rounded-md z-0  ",
        className
      )}
    >
      <div className="absolute inset-0 top-0 ">
        <div className="relative flex w-full flex-1 isolate items-center justify-center  h-full">
          {/* Left Side */}
          <motion.div
            initial={{ opacity: 0.5, width: "15rem" }}
            whileInView={{ opacity: 1, width: "30rem" }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
            className="absolute right-1/2 top-[2rem] h-[50vh] w-[30rem] bg-gradient-to-l from-[hsl(var(--muted))] to-transparent "
          />
          {/* Right Side */}
          <motion.div
            initial={{ opacity: 0.5, width: "15rem" }}
            whileInView={{ opacity: 1, width: "30rem" }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
            className="absolute left-1/2 top-[2rem] h-[50vh] w-[30rem] bg-gradient-to-r from-[hsl(var(--muted))] to-transparent"
          />
          {/* Blur for the bottom */}
          <div className="absolute top-1/2 inset-x-0 h-[50vh] -translate-y-24 w-full  bg-[hsl(var(--card))] blur-3xl" />
          {/* Light coming out from source */}
          <motion.div
            initial={{ width: "15rem" }}
            whileInView={{ width: "28rem" }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
            className="absolute z-50 h-[30vh] rounded-full bg-[hsl(var(--primary))] opacity-50 blur-3xl top-[2rem] "
          />
          {/* Light source */}
          <motion.div
            initial={{ width: "15rem" }}
            whileInView={{ width: "30rem" }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
            className="absolute z-50 h-1.5 w-[30rem] top-[2rem] bg-[hsl(var(--primary))]"
          />
          {/* Shade for the top */}
          <div className="absolute z-40 h-[2rem] w-full top-0 bg-[hsl(var(--background))] blur-4xl " />
        </div>
      </div>

      <div className="relative z-50 flex  flex-col items-center px-5 w-full ">
        {children}
      </div>
    </div>
  );
};
