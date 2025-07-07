import { StructuredRepository } from "@/app/(protected)/repository/[id]/repo-explorer";
import SummaryModal from "@/app/(protected)/repository/[id]/summary-modal";
import { siteConfig } from "@/config/site";
import { DirectoryWithRelations } from "@/interfaces/github";
import { ArrowDownToLine, ArrowUpFromLine, Copy } from "lucide-react";
import { User } from "next-auth";
import Link from "next/link";
import React, { useState } from "react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { AvatarMenu } from "../ui/avatar-menu";
import { Button } from "../ui/button";

interface RepoDetailsNavbarProps {
  repository: StructuredRepository;
  user: User;
  showAllSummaries: boolean;
  toggleAllSummaries: () => void;
}

const Navbar = ({
  repository,
  user,
  toggleAllSummaries,
  showAllSummaries,
}: RepoDetailsNavbarProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState("");

  // Function to generate the full structured summary
  const generateFullSummary = () => {
    let summary = `# Repository: ${repository.name} (${repository.owner})\n\n`;

    const processDirectory = (dir: DirectoryWithRelations, depth: number) => {
      const indent = "  ".repeat(depth);
      summary += `${indent}## Directory: ${dir.path}\n`;

      // Process files in this directory
      dir.files.forEach((file) => {
        summary += `${indent}- File: ${file.path}\n`;
        if (file.summary) {
          summary += `${indent}  Summary: ${file.summary}\n\n`;
        } else {
          summary += `${indent}  No summary available.\n\n`;
        }
      });

      // Process subdirectories
      dir.children.forEach((childDir) => {
        processDirectory(childDir, depth + 1);
      });
    };

    // Process root directories
    repository.directories.forEach((dir) => {
      processDirectory(dir, 1);
    });

    // Process root files
    if (repository.rootFiles.length > 0) {
      summary += `## Root Files\n`;
      repository.rootFiles.forEach((file) => {
        summary += `- File: ${file.path}\n`;
        if (file.summary) {
          summary += `  Summary: ${file.summary}\n\n`;
        } else {
          summary += `  No summary available.\n\n`;
        }
      });
    }

    return summary;
  };

  const handleCopyFullSummary = () => {
    const summary = generateFullSummary();
    setGeneratedSummary(summary);
    setIsModalOpen(true);
  };
  return (
    <header className=" px-4 py-2 flex items-center justify-between sticky border-dashed top-0 z-50 w-full border-b bg-background/95 backdrop-blur ">
      <div className="flex gap-2 items-center">
        <Link
          href="/dashboard"
          className=" hover:opacity-80 transition-opacity"
        >
          <span className="tracking-wide text-2xl font-medium">
            {siteConfig.name}
          </span>
        </Link>
        <a
          href={repository?.url}
          target="_blank"
          className="flex gap-2 items-center border p-2  rounded-lg w-fit cursor-pointer hover:bg-secondary transition-colors duration-150 group"
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={repository.avatarUrl} />
          </Avatar>
          <div className="hidden sm:flex gap-1">
            <span className="text-foreground">{repository.owner}</span>
            <span className="text-muted group-hover:text-muted-foreground ">
              {"/"}
            </span>
            <span className="text-foreground">{repository.name}</span>
          </div>
        </a>
      </div>
      <div className="flex gap-2 items-center">
        <Button variant="outline" onClick={toggleAllSummaries}>
          <span className="hidden sm:block">
            {showAllSummaries
              ? "Collapse All Summaries"
              : "Expand All Summaries"}
          </span>
          <span className="block sm:hidden">
            {showAllSummaries ? (
              <ArrowDownToLine className="w-4 h-4" />
            ) : (
              <ArrowUpFromLine className="h-4 w-4" />
            )}
          </span>
        </Button>
        <Button
          variant="outline"
          onClick={handleCopyFullSummary}
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          <span className="hidden sm:block">Copy Full Summary</span>
        </Button>
        <AvatarMenu user={user} />
      </div>
      <SummaryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        summary={generatedSummary}
        owner={repository.owner}
        name={repository.name}
      />
    </header>
  );
};

export default Navbar;
