import NewRepoDialog from "@/app/(protected)/dashboard/new-repo-dialog";
import { cn } from "@/lib/utils";
import { scaleInVariant } from "@/lib/variants";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { buttonVariants } from "../../ui/button";

const EmptyRepositoriesSidebarRepoList = () => {
  const [showNewRepoDialog, setShowNewRepoDialog] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center justify-center h-[400px] px-4">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Plus className="h-6 w-6" />
        </div>
        <h3 className="font-medium mb-2">No repositories yet</h3>
        <p className="text-sm text-muted-foreground text-center mb-4">
          Connect your first repository to get started
        </p>
        <motion.div
          variants={scaleInVariant}
          initial="hidden"
          whileInView="visible"
          className={cn(
            buttonVariants({
              variant: "outline",
              className:
                "bg-transparent hover:bg-muted/20 rounded cursor-pointer relative",
            })
          )}
          onClick={() => setShowNewRepoDialog(true)}
        >
          <Plus className="h-5 w-5" />
          Connect New Repository
        </motion.div>
      </div>
      <NewRepoDialog
        showNewRepoDialog={showNewRepoDialog}
        setShowNewRepoDialog={setShowNewRepoDialog}
      />
    </>
  );
};

export default EmptyRepositoriesSidebarRepoList;
