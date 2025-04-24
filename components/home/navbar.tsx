import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { User } from "next-auth";
import Link from "next/link";
import React from "react";
import FadeIn from "../global/fade-in";
import MaxWidthWrapper from "../global/max-width-wrapper";
import { AvatarMenu } from "../ui/avatar-menu";
import SignIn from "../ui/sign-in";

interface NavbarProps {
  user: User | undefined;
}

const Navbar = ({ user }: NavbarProps) => {
  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 h-14 z-[99] border-b border-dashed backdrop-blur-lg"
      )}
    >
      <FadeIn delay={0.1} className="size-full">
        <MaxWidthWrapper className="flex items-center justify-between">
          <div className="flex items-center space-x-12">
            <Link href="/">
              <span className="text-3xl font-normal tracking-wider">
                {siteConfig.name}
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center">
            {user ? <AvatarMenu user={user} /> : <SignIn />}
          </div>
        </MaxWidthWrapper>
      </FadeIn>
    </header>
  );
};

export default Navbar;
