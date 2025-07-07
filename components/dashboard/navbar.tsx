"use client";
import NewRepoDialog from "@/app/(protected)/dashboard/new-repo-dialog";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { containerVariant, scaleInVariant } from "@/lib/variants";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { User } from "next-auth";
import Link from "next/link";
import { useState } from "react";
import GradientInsetBackground from "../componentX/gradient-inset-background";
import { AvatarMenu } from "../ui/avatar-menu";

interface NavbarProps {
  user: User;
}

export function Navbar({ user }: NavbarProps) {
  const [showNewRepoDialog, setShowNewRepoDialog] = useState(false);

  return (
    <>
      <motion.div
        variants={containerVariant}
        initial="hidden"
        whileInView="visible"
        className="sticky top-0 inset-x-0 z-50 flex items-center justify-between  p-4 sm:px-8 border-b border-dashed bg-background"
      >
        <Link href="/dashboard">
          <span className="text-xl tracking-wider">{siteConfig.name}</span>
        </Link>

        <div className="flex items-center  gap-4">
          <motion.div
            variants={scaleInVariant}
            className={cn(
              buttonVariants({
                variant: "outline",
                className:
                  "bg-transparent hover:bg-muted/20 rounded cursor-pointer relative",
              })
            )}
            onClick={() => setShowNewRepoDialog(true)}
          >
            <GradientInsetBackground />
            <Plus className="h-5 w-5" />
            <span className="hidden sm:block">Connect New Repository</span>
          </motion.div>
          <AvatarMenu user={user} />
        </div>
      </motion.div>
      <NewRepoDialog
        showNewRepoDialog={showNewRepoDialog}
        setShowNewRepoDialog={setShowNewRepoDialog}
      />
    </>
  );
}
