import { siteConfig } from "@/config/site";
import { containerVariant, scaleInVariant } from "@/lib/variants";
import { motion } from "framer-motion";
import { ZapIcon } from "lucide-react";
import { User } from "next-auth";
import Link from "next/link";
import React from "react";
import { AvatarMenu } from "../ui/avatar-menu";
import { buttonVariants } from "../ui/button";

interface NavbarProps {
  toggleAuthDialog: () => void;
  user?: User;
}

const Navbar = ({ toggleAuthDialog, user }: NavbarProps) => {
  return (
    <div className="sticky top-0 inset-x-0 h-14 z-[99] backdrop-blur-lg">
      <div className="flex items-center justify-between px-3 md:px-4 lg:px-5 py-2 md:py-3">
        <Link href="/">
          <span className="text-3xl font-normal tracking-wider">
            {siteConfig.name}
          </span>
        </Link>

        {user ? (
          <AvatarMenu user={user} />
        ) : (
          <motion.div
            variants={containerVariant}
            initial="hidden"
            whileInView="visible"
            className="flex items-center gap-x-4"
          >
            <motion.div
              variants={scaleInVariant}
              onClick={toggleAuthDialog}
              className={buttonVariants({
                variant: "ghost",
                className: "cursor-pointer",
              })}
            >
              Sign In
            </motion.div>
            <motion.div
              variants={scaleInVariant}
              onClick={toggleAuthDialog}
              className={buttonVariants({ className: "cursor-pointer" })}
            >
              Get Started
              <ZapIcon className="size-3.5 ml-1.5 text-orange-500 fill-orange-500" />
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
