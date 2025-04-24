import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../../ui/button";

const EmptyRepositoriesSidebarRepoList = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[400px] px-4">
      <div className="rounded-full bg-muted p-3 mb-4">
        <Plus className="h-6 w-6" />
      </div>
      <h3 className="font-medium mb-2">No repositories yet</h3>
      <p className="text-sm text-muted-foreground text-center mb-4">
        Connect your first repository to get started with version control
      </p>
      <Link
        className={cn(buttonVariants({ variant: "outline" }))}
        href="/dashboard?action=connect"
      >
        <Plus className="h-4 w-4 mr-2" />
        Connect Repository
      </Link>
    </div>
  );
};

export default EmptyRepositoriesSidebarRepoList;
