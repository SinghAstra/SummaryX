"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Repository, RepositoryStatus } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface RepositoryCardProps {
  repository: Repository;
}

const getStatusColor = (status: RepositoryStatus) => {
  if (status === "SUCCESS") {
    return "bg-green-500";
  }
  if (status.includes("FAILED")) {
    return "bg-red-500";
  }
  return "bg-yellow-500";
};

const SidebarRepositoryCard = ({ repository }: { repository: Repository }) => {
  return (
    <div className="flex items-center gap-3 rounded border p-3 hover:bg-muted/20  cursor-pointer transition-colors">
      <Avatar className="h-8 w-8">
        <AvatarImage src={repository.avatarUrl || ""} alt={repository.owner} />
        <AvatarFallback>{repository.owner[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="font-medium line-clamp-1">{repository.name}</span>
        <span className="text-sm text-muted-foreground">
          {repository.owner}
        </span>
      </div>
      <div className="ml-auto">
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            getStatusColor(repository.status)
          )}
        />
      </div>
    </div>
  );
};

export function RepositoryCard({ repository }: RepositoryCardProps) {
  const [message, setMessage] = useState<string | null>(null);

  const getHrefFromStatus = (repository: Repository) => {
    if (repository.status === RepositoryStatus.SUCCESS) {
      return `/repository/${repository.id}`;
    }
    return `/logs/${repository.id}`;
  };

  const href = getHrefFromStatus(repository);

  useEffect(() => {
    if (!message) return;
    toast(message);
    setMessage(null);
  }, [message]);

  return (
    <Link href={href}>
      <SidebarRepositoryCard repository={repository} />
    </Link>
  );
}
