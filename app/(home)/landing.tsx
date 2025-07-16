"use client";

import AuthDialog from "@/components/componentX/auth-dialog";
import ConicGradientBackground from "@/components/componentX/conic-gradient-background";
import MovingBackground from "@/components/componentX/moving-background";
import MovingGlow from "@/components/componentX/moving-glow";
import RadialFadePulsatingBackground from "@/components/componentX/radial-fade-pulsating-background";
import Footer from "@/components/home/footer";
import Navbar from "@/components/home/navbar";
import { buttonVariants } from "@/components/ui/button";
import DashboardPreview from "@/components/ui/preview/dashboard-preview";
import { siteConfig } from "@/config/site";
import { RepositoryPreview } from "@/interfaces/github";
import { cn } from "@/lib/utils";
import {
  blurInVariant,
  containerVariant,
  scaleInVariant,
} from "@/lib/variants";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FaGithub, FaTwitterSquare } from "react-icons/fa";

const LandingPage = ({
  previewRepos,
}: {
  previewRepos: RepositoryPreview[];
}) => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const toggleAuthDialog = () => {
    setShowAuthDialog(!showAuthDialog);
  };

  return (
    <>
      <Navbar toggleAuthDialog={toggleAuthDialog} />
      <motion.div
        variants={containerVariant}
        initial="hidden"
        whileInView="visible"
      >
        <div className="px-3 py-20 flex flex-col items-center justify-center text-center">
          <RadialFadePulsatingBackground />
          <motion.div variants={scaleInVariant}>
            <Link
              href={siteConfig.links.twitter}
              target="_blank"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "rounded bg-transparent hover:bg-transparent group relative text-foreground px-3 py-1 flex gap-2"
              )}
            >
              <MovingBackground />
              <FaTwitterSquare className="size-3" /> Follow For Updates
              <ArrowRightIcon className="size-3 transform-all duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <motion.h1
            variants={blurInVariant}
            className="text-foreground text-center py-6 text-6xl md:text-7xl lg:text-8xl font-medium "
          >
            Summarize <br />
            <span className="text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text">
              Repository
            </span>
          </motion.h1>
          <motion.p
            variants={blurInVariant}
            className="mb-8 text-lg md:text-xl tracking-tight text-muted-foreground "
          >
            Give me public github repository url &
            <br />I will help you understand the codebase.
          </motion.p>
          <div className="flex items-center justify-center gap-4">
            <motion.button
              variants={scaleInVariant}
              className={cn(
                buttonVariants({}),
                "relative border px-3 py-1 rounded flex items-center group cursor-pointer tracking-wide text-base"
              )}
              onClick={toggleAuthDialog}
            >
              Get started for free
              <ArrowRightIcon
                className="ml-1 size-4 transition-all duration-300 
                group-hover:translate-x-1"
              />
            </motion.button>
            <motion.div variants={scaleInVariant}>
              <Link
                href={siteConfig.links.githubRepo}
                target="_blank"
                className={cn(
                  buttonVariants({
                    variant: "outline",
                  }),
                  "rounded group relative text-foreground px-3 py-1 flex items-center gap-2 bg-muted/20 hover:bg-muted/40 tracking-wide font-normal text-base"
                )}
              >
                <MovingGlow />
                <FaGithub className="size-3 " /> Github
              </Link>
            </motion.div>
          </div>
        </div>
        <div className="relative px-4 sm:px-8 ">
          <div className="relative  overflow-hidden rounded-sm border">
            <MovingGlow
              animationDuration={12}
              borderWidth={4}
              initialTransparent={300}
            />
            <div
              className="relative m-4 rounded-inherit "
              style={{
                maskImage:
                  "linear-gradient(to bottom, black 80%, transparent 100%)",
              }}
            >
              <DashboardPreview previewRepos={previewRepos} />
            </div>
          </div>
          <div
            className="absolute inset-x-0 bottom-0 h-1/4"
            style={{
              background:
                "linear-gradient(180deg,hsla(var(--background)/0),hsl(var(--background)))",
            }}
          />
        </div>

        <div className="min-h-screen relative px-4 sm:px-8 flex items-center">
          <motion.div
            variants={containerVariant}
            initial="hidden"
            whileInView="visible"
            className="flex flex-col gap-4 sm:gap-8 sm:max-w-[60%] text-balance"
          >
            <motion.h1
              variants={blurInVariant}
              className="text-5xl text-balance leading-[1.3]"
            >
              Understand any Public Github Repository by Generating Context
              Aware Summary for all Files in Prompt Friendly Manner.
            </motion.h1>
            <motion.div
              variants={scaleInVariant}
              className="relative border px-6 py-2 text-xl rounded flex items-center group cursor-pointer w-fit"
              onClick={toggleAuthDialog}
            >
              <MovingGlow />
              Get started
              <ArrowRightIcon
                className="ml-1 size-4 transition-all duration-300 
                group-hover:translate-x-1"
              />
            </motion.div>
          </motion.div>
          <ConicGradientBackground />
        </div>
      </motion.div>
      <Footer />
      <AuthDialog
        isDialogVisible={showAuthDialog}
        setIsDialogVisible={setShowAuthDialog}
      />
    </>
  );
};

export default LandingPage;
