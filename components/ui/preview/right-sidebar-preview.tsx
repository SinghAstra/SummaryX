"use client";

import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import GradientInsetBackground from "../../componentX/gradient-inset-background";

export function RightSidebarPreview() {
  return (
    <div className="w-80 hidden lg:flex p-2 ">
      <div className="h-fit border px-3 py-2 rounded flex flex-col gap-1">
        <h3>Follow For Updates</h3>
        <p className="text-muted-foreground text-sm">
          More tools are being developed to enhance your development workflow.
        </p>
        <a
          className={cn(
            buttonVariants({
              variant: "outline",
              className:
                "w-full mt-2 tracking-wide font-normal rounded relative bg-transparent hover:bg-muted/20",
            })
          )}
          href={siteConfig.links.twitter}
          target="_blank"
        >
          <GradientInsetBackground />
          Connect on X
        </a>
      </div>
    </div>
  );
}
