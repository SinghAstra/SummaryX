"use client";

import {
  blurInVariant,
  containerVariant,
  scaleInVariant,
} from "@/lib/variants";
import { motion } from "framer-motion";
import { User } from "next-auth";
import Link from "next/link";
import React, { useState } from "react";
import AuthDialog from "./componentX/auth-dialog";
import Navbar from "./home/navbar";
import { buttonVariants } from "./ui/button";

interface NotFoundProps {
  user: User | undefined;
}

const NotFound = ({ user }: NotFoundProps) => {
  const href = user ? "/dashboard" : "/";
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const toggleAuthDialog = () => {
    setShowAuthDialog(!showAuthDialog);
  };

  return (
    <motion.div
      variants={containerVariant}
      initial={"hidden"}
      whileInView={"visible"}
      className="min-h-screen flex flex-col"
    >
      <Navbar toggleAuthDialog={toggleAuthDialog} user={user} />
      <div className="flex-1 flex flex-col gap-4 items-center justify-center ">
        <div className="text-center flex flex-col items-center justify-center  gap-2">
          <motion.h2
            variants={blurInVariant}
            className="text-4xl md:text-5xl lg:text-7xl font-bold"
          >
            404
          </motion.h2>
          <motion.p
            variants={blurInVariant}
            className="text-muted-foreground text-md font-medium"
          >
            Page not found {":("}
          </motion.p>
          <motion.p variants={blurInVariant}>
            Oops! The page you&apos;re looking for doesn&apos;t exist.
          </motion.p>
        </div>
        <motion.div variants={scaleInVariant}>
          <Link href={href} className={buttonVariants({ variant: "outline" })}>
            Back to Home
          </Link>
        </motion.div>
      </div>
      <AuthDialog
        isDialogVisible={showAuthDialog}
        setIsDialogVisible={setShowAuthDialog}
      />
    </motion.div>
  );
};

export default NotFound;
