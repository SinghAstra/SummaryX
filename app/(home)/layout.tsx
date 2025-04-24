import Footer from "@/components/home/footer";
import Navbar from "@/components/home/navbar";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import React, { ReactNode } from "react";

interface HomeLayoutProps {
  children: ReactNode;
}

const HomeLayout = async ({ children }: HomeLayoutProps) => {
  const session = await getServerSession(authOptions);
  return (
    <div className="relative z-0">
      <div className="absolute top-0 inset-x-0 bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] h-[100vh] z-[-1]" />
      <Navbar user={session?.user} />
      <main className="mt-12 mx-auto w-full pt-12 ">{children}</main>
      <Footer />
    </div>
  );
};

export default HomeLayout;
