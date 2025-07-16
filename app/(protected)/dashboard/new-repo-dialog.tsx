"use client";

import Dialog from "@/components/componentX/dialog";
import { useToastContext } from "@/components/providers/toast";
import { buttonVariants } from "@/components/ui/button";
import { fetchAllUserRepository } from "@/lib/api";
import { parseGithubUrl } from "@/lib/github";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { mutate } from "swr";
import { AddNewRepository } from "./new-repo-input";

interface NewRepoDialogProps {
  showNewRepoDialog: boolean;
  setShowNewRepoDialog: Dispatch<SetStateAction<boolean>>;
}

function NewRepoDialog({
  showNewRepoDialog,
  setShowNewRepoDialog,
}: NewRepoDialogProps) {
  const [url, setUrl] = useState("");
  const { setToastMessage } = useToastContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [alertProcessingRepo, setAlertProcessingRepo] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    try {
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
        setShowNewRepoDialog(false);
        setAlertProcessingRepo(true);
        return;
      }

      processRepository();
    } catch (error) {
      if (error instanceof Error) {
        console.log("error.stack is ", error.stack);
        console.log("error.message is ", error.message);
      }
      setToastMessage("Check Your Network Connection");
    }
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
        setAlertProcessingRepo(false);
        setToastMessage(data.message);
        return;
      }

      mutate(fetchAllUserRepository);

      setIsSuccess(true);
      setUrl("");
      setAlertProcessingRepo(false);

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
      setAlertProcessingRepo(false);
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
    setAlertProcessingRepo(false);
  };

  if (!showNewRepoDialog) return;

  return (
    <div className="w-full m-2">
      <Dialog
        isDialogVisible={alertProcessingRepo}
        setIsDialogVisible={setAlertProcessingRepo}
      >
        <div className="flex items-center border-b px-4 py-2">
          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 text-xl" />
          Pending Repository Analysis
        </div>
        <div className="px-4 py-2">
          You have repository analysis already in progress. Due to API
          restrictions, starting a new analysis will stop the processing of all
          other repositories. Do you want to continue with the new repository
          analysis?
        </div>
        <div className="flex px-4 py-2 gap-2">
          <div
            onClick={handleCancelNewRepo}
            className={cn(
              buttonVariants({
                variant: "outline",
                className:
                  "bg-transparent hover:bg-transparent flex-2 rounded font-normal",
              })
            )}
          >
            Cancel
          </div>
          <div
            onClick={handleContinueWithNewRepo}
            className={cn(
              buttonVariants({
                className: "flex-1 rounded font-normal tracking-wider relative",
              })
            )}
          >
            Continue with new analysis
          </div>
        </div>
      </Dialog>
      <Dialog
        isDialogVisible={showNewRepoDialog}
        setIsDialogVisible={setShowNewRepoDialog}
      >
        <AddNewRepository
          url={url}
          setUrl={setUrl}
          handleSubmit={handleSubmit}
          isSuccess={isSuccess}
          isProcessing={isProcessing}
        />
      </Dialog>
    </div>
  );
}

export default NewRepoDialog;
