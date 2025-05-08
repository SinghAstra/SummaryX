"use client";

import { useToastContext } from "@/components/providers/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { fetchAllUserRepository } from "@/lib/api";
import { parseGithubUrl } from "@/lib/github";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AlertCircle, SearchIcon, SparklesIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { mutate } from "swr";

function DashboardPage() {
  const [url, setUrl] = useState("");
  const { setToastMessage } = useToastContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const formRef = useRef<HTMLDivElement>(null);
  const actionQuery = searchParams.get("action");
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (actionQuery === "connect") {
      setShowGuide(true);
    }
  }, [actionQuery]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    const validation = parseGithubUrl(url);

    if (!validation.isValid) {
      setIsProcessing(false);
      setToastMessage(
        validation.message ? validation.message : "Invalid GitHub URL"
      );
      return;
    }

    const response = await fetch("/api/repository/processing");
    const data = await response.json();

    if (!response.ok) {
      setToastMessage(data.message);
      return;
    }

    const pendingRepositories = data.repositories;

    if (pendingRepositories.length > 0) {
      setIsProcessing(false);
      setShowAlert(true);
      return;
    }

    processRepository();
  };

  const processRepository = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch("/api/repository/start-process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ githubUrl: url }),
      });

      const data = await response.json();

      if (!response.ok) {
        setToastMessage(data.message);
        return;
      }

      mutate(fetchAllUserRepository);

      setIsSuccess(true);
      setUrl("");
      if (showGuide) {
        dismissGuide();
      }

      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      if (error instanceof Error) {
        console.log("error.stack is ", error.stack);
        console.log("error.message is ", error.message);
      }
      setToastMessage("Check Your Network Connection");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinueWithNewRepo = async () => {
    try {
      setIsProcessing(true);
      setShowAlert(false);
      const response = await fetch("/api/repository/stop-processing");
      const data = await response.json();

      if (!response.ok) {
        setToastMessage(data.message);
        return;
      }

      mutate(fetchAllUserRepository);
      processRepository();
    } catch (error) {
      if (error instanceof Error) {
        console.log("error.stack is ", error.stack);
        console.log("error.message is ", error.message);
      }
      setToastMessage("Check Your Network Connection");
    }
  };

  const handleCancelNewRepo = () => {
    setShowAlert(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowGuide(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const dismissGuide = useCallback(() => {
    setShowGuide(false);
    const params = new URLSearchParams(searchParams);
    params.delete("action");
    router.push(`${pathName}?${params}`);
  }, [pathName, router, searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        dismissGuide();
      }
    };

    if (showGuide) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showGuide, dismissGuide]);

  return (
    <div className="w-full m-2">
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
              Pending Repository Processing
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have repository processing already in progress. Due to API
              restrictions, starting a new repository will stop the processing
              of all other repositories. Do you want to continue with the new
              repository processing ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelNewRepo} className="w-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleContinueWithNewRepo}
              className="w-full"
            >
              Continue with new repository
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {showGuide && (
        <div className="absolute inset-0 ">
          <div className="relative w-full h-full  flex items-center justify-center backdrop-blur-sm">
            <motion.div
              className={`bg-muted/30 rounded-xl border w-full max-w-lg`}
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                ease: "easeInOut",
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              ref={formRef}
            >
              <form onSubmit={handleSubmit}>
                <div className="flex items-center border-b px-4 py-3">
                  <SearchIcon className="w-5 h-5 text-muted-foreground mr-2" />
                  <input
                    type="url"
                    placeholder="Paste Your Github repository URL..."
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                    }}
                    disabled={isProcessing}
                    className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-base placeholder:text-muted-foreground"
                  />
                  <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </div>

                <div className="border-t px-4 py-3 flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <SparklesIcon className="w-4 h-4" />
                    <span>Uses GitHub API</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      disabled={!url || isProcessing || isSuccess}
                      type="submit"
                      className={cn(
                        "relative overflow-hidden",
                        isSuccess && "bg-yellow-400 "
                      )}
                    >
                      {isSuccess ? (
                        <div className="flex items-center">
                          <FaSpinner className="mr-2 h-5 w-5 animate-spin" />
                          Processing Started...
                        </div>
                      ) : isProcessing ? (
                        <div className="flex items-center">
                          <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        "Generate Summary"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
      <div className={`rounded-xl border`}>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center border-b px-4 py-3">
            <SearchIcon className="w-5 h-5 text-muted-foreground mr-2" />
            <input
              type="url"
              placeholder="Paste Your Github repository URL..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
              }}
              disabled={isProcessing}
              className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-base placeholder:text-muted-foreground"
            />
            <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>

          <div className="border-t px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <SparklesIcon className="w-4 h-4" />
              <span>Uses GitHub API</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                disabled={!url || isProcessing || isSuccess}
                type="submit"
                className={cn(
                  "relative overflow-hidden",
                  isSuccess && "bg-yellow-400 "
                )}
              >
                {isSuccess ? (
                  <div className="flex items-center">
                    <FaSpinner className="mr-2 h-5 w-5 animate-spin" />
                    Processing Started...
                  </div>
                ) : isProcessing ? (
                  <div className="flex items-center">
                    <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  "Generate Summary"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DashboardPage;
