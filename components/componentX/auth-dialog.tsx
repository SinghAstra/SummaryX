import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/config/site";
import { Loader } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { FaGithub } from "react-icons/fa";
import Dialog from "./dialog";
import GradientInsetBackground from "./gradient-inset-background";
import MovingBackground from "./moving-background";

interface AuthDialogProps {
  isDialogVisible: boolean;
  setIsDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthDialog = ({
  isDialogVisible,
  setIsDialogVisible,
}: AuthDialogProps) => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

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
      setIsDialogVisible(false);
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
      setIsDialogVisible(false);
    }
  };

  return (
    <>
      <Dialog
        className="max-w-[400px] relative bg-background"
        isDialogVisible={isDialogVisible}
        setIsDialogVisible={setIsDialogVisible}
      >
        <GradientInsetBackground />
        <div className="space-y-4 m-4 text-center">
          <div className="space-y-1 mb-4">
            <h1 className="text-3xl tracking-wider">{siteConfig.name}</h1>
            <span className="text-sm text-muted-foreground">
              Sign In to Get Started
            </span>
          </div>
          <Button
            onClick={handleGitHubSignIn}
            disabled={isGithubLoading}
            variant="outline"
            className="w-full text-foreground rounded font-normal"
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
              <span className="bg-background px-2 text-foreground">Or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full text-foreground rounded font-normal bg-transparent hover:bg-transparent relative"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            <MovingBackground />
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
      </Dialog>
    </>
  );
};

export default AuthDialog;
