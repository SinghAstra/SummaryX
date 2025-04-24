import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";
import { buttonVariants } from "../ui/button";

const SidebarRepoHeader = () => {
  return (
    <div className="p-4 hidden md:flex">
      <Link
        className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        href="/dashboard?action=connect"
      >
        <Plus className="mr-2 h-4 w-4" />
        New Repository
      </Link>
    </div>
  );
};

export default SidebarRepoHeader;
