import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: string;
  owner: string;
  name: string;
}

export default function SummaryModal({
  isOpen,
  onClose,
  summary,
  owner,
  name,
}: SummaryModalProps) {
  const [currentChunk, setCurrentChunk] = useState(0);

  // Split the summary into chunks of ~8000 characters for better LLM handling
  const chunkSize = 8000;
  const summaryChunks: string[] = [];

  for (let i = 0; i < summary.length; i += chunkSize) {
    summaryChunks.push(summary.substring(i, i + chunkSize));
  }

  const totalChunks = summaryChunks.length;

  const introChunk = `INSTRUCTION:
    The repository : ${owner} / ${name} is divided into ${totalChunks} parts. 
    Please do not process, summarize, analyze, or respond until all parts have been provided. 
    Mentally combine all parts into a single complete document once received. 
    Wait patiently for the next parts.`;
  const handleCopyChunk = () => {
    const chunk = summaryChunks[currentChunk - 1];
    const textToCopy =
      currentChunk === 0 && totalChunks > 1
        ? introChunk
        : `${currentChunk > 1 && "(Continued) "}${chunk}${
            currentChunk < totalChunks && " (Continued in next part)"
          }`;

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast(`Part ${currentChunk} / ${totalChunks} copied to clipboard`);

        // If there are more chunks, advance to the next one
        if (currentChunk < totalChunks) {
          setCurrentChunk(currentChunk + 1);
        } else {
          // Reset and close if we've copied all chunks
          setCurrentChunk(0);
          onClose();
        }
      })
      .catch((error) => {
        toast("Failed to copy to clipboard");
        if (error instanceof Error) {
          console.log("error.stack is ", error.stack);
          console.log("error.message is ", error.message);
        }
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Repository Summary</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {totalChunks > 1
              ? `This summary is large and has been split into ${totalChunks} parts for easier use with LLMs. Copy each part separately.`
              : "Copy this summary to use with your LLM."}
            <br />
          </p>
          <p className="text-sm text-muted-foreground">
            {currentChunk === 0 &&
              totalChunks > 1 &&
              "This is the introduction prompt so that LLM can understand the context of the summary and it waits till all the parts are provided to him."}
          </p>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto border rounded p-3 bg-muted/20 text-sm">
          <pre className="whitespace-pre-wrap font-mono text-xs">
            {currentChunk === 0
              ? introChunk
              : `This is ${currentChunk} part of total ${totalChunks} parts of the summary.${
                  currentChunk > 1 ? "(Continued) " : ""
                }${summaryChunks[currentChunk - 1]}${
                  currentChunk < totalChunks ? " (Continued in next part)" : ""
                }`}
          </pre>
        </div>

        <DialogFooter className="flex justify-between items-center gap-2">
          {totalChunks > 1 && (
            <div className="text-sm text-muted-foreground">
              Part {currentChunk} of {totalChunks}
            </div>
          )}
          <Button
            onClick={handleCopyChunk}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            {totalChunks > 1 ? `Copy Part ${currentChunk}` : "Copy Summary"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
