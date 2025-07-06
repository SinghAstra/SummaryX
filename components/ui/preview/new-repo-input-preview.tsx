"use client";

import AuthDialog from "@/components/componentX/auth-dialog";
import { Button } from "@/components/ui/button";
import { SearchIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";

function AddNewRepository({
  toggleAuthDialog,
}: {
  toggleAuthDialog: () => void;
}) {
  const [url, setUrl] = useState("");

  return (
    <form onSubmit={toggleAuthDialog}>
      <div className="flex items-center border-b px-4 py-3">
        <SearchIcon className="w-5 h-5 text-muted-foreground mr-2" />
        <input
          type="url"
          placeholder="Paste Your Github repository URL..."
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
          }}
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
            type="submit"
            className={"relative overflow-hidden"}
          >
            Analyze
          </Button>
        </div>
      </div>
    </form>
  );
}

function NewRepoInputPreview() {
  const toggleAuthDialog = () => {
    setShowAuthDialog(!showAuthDialog);
  };
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  return (
    <div className="w-full m-2">
      <div className="rounded border max-w-xl mx-auto">
        <AddNewRepository toggleAuthDialog={toggleAuthDialog} />
      </div>
      <AuthDialog
        isDialogVisible={showAuthDialog}
        setIsDialogVisible={setShowAuthDialog}
      />
    </div>
  );
}

export default NewRepoInputPreview;
