"use client";

import { Button } from "@/components/ui/button";
import RotatingBorderBadge from "@/components/ui/rotating-border-badge";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/config/site";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";

import FadeIn from "@/components/global/fade-in";
import FadeSlideIn from "@/components/global/fade-slide-in";
import { Braces, ClipboardCheck, FileSearch, Loader } from "lucide-react";

const features = [
  {
    title: "Comprehensive File Analysis",
    description:
      "Get concise summaries of individual code files and understand their purpose within the project.",
    icon: FileSearch,
  },
  {
    title: "One-click Copy Summary",
    description:
      "Copy the full structured summary including file paths and insights to paste into any LLM.",
    icon: ClipboardCheck,
  },
  {
    title: "LLM-Ready Insights",
    description:
      "Optimized summaries for AI tools to help you debug, refactor, or explore large repositories faster.",
    icon: Braces,
  },
];

export default function SignIn() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  console.log("callbackUrl is ", callbackUrl);

  const handleGitHubSignIn = async () => {
    try {
      setIsGithubLoading(true);
      await signIn("github", {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log("error.stack is ", error.stack);
        console.log("error.message is ", error.message);
      }
    } finally {
      setIsGithubLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      await signIn("google", {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log("error.stack is ", error.stack);
        console.log("error.message is ", error.message);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      <div className="hidden lg:flex lg:w-3/5 z-20 bg-card">
        <div className="w-full  flex flex-col justify-between">
          <div className="backdrop-blur-md p-6">
            <Link href="/">
              <h1 className="text-5xl font-bold ">{siteConfig.name}</h1>
            </Link>
            <p className="text-muted-foreground mt-1 text-lg">
              {siteConfig.description}
            </p>
          </div>

          <div className="space-y-4 max-w-2xl p-6">
            {features.map((feature, i) => (
              <FadeSlideIn key={i} delay={i * 0.2}>
                <div className="flex items-start gap-4 p-4 rounded-lg border backdrop-blur-md">
                  <div className="p-2 rounded-md border">
                    <feature.icon />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </FadeSlideIn>
            ))}
          </div>

          <div className="text-sm text-muted-foreground p-6">
            © 2024 {siteConfig.name}. All rights reserved.
          </div>
        </div>
      </div>

      <div className="w-full lg:w-2/5 flex items-center justify-center">
        <div className=" flex items-center justify-center relative">
          {/* Decorative elements */}
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
          <FadeIn delay={0.1}>
            <div className="w-[400px] p-8 bg-card/40 backdrop-blur-sm rounded-md border space-y-6">
              <div className="space-y-2 text-center">
                <RotatingBorderBadge title={`Welcome to ${siteConfig.name}`} />
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleGitHubSignIn}
                  disabled={isGithubLoading}
                  variant="outline"
                  className="w-full text-foreground"
                >
                  {isGithubLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Wait ...
                    </>
                  ) : (
                    <>
                      <FaGithub className="mr-2 h-5 w-5" />
                      <span className="text-center tracking-wide">
                        Continue with GitHub
                      </span>
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase ">
                    <span className="bg-background px-2 text-foreground">
                      Or
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full text-foreground"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Wait ...
                    </>
                  ) : (
                    <>
                      <Image
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        width={18}
                        height={18}
                        className="mr-2"
                      />
                      <span className="text-center tracking-wide">
                        Continue with Google
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
