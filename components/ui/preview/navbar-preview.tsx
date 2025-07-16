"use client";
import AuthDialog from "@/components/componentX/auth-dialog";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { containerVariant, scaleInVariant } from "@/lib/variants";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback } from "../avatar";

export function NavbarPreview() {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const toggleAuthDialog = () => {
    setShowAuthDialog(!showAuthDialog);
  };

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
            onClick={() => toggleAuthDialog()}
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:block">Connect New Repository</span>
          </motion.div>
          <Avatar className="h-8 w-8 border border-border">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </motion.div>
      <AuthDialog
        isDialogVisible={showAuthDialog}
        setIsDialogVisible={setShowAuthDialog}
      />
    </>
  );
}
