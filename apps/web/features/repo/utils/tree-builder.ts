export interface FileTreeNode {
   name: string;
   relativePath: string;
   type: "file" | "folder";
   extension?: string;
   size?: number;
   summaryStatus?: string;
   children: FileTreeNode[];
}


export function buildFileTree(files: any[]): FileTreeNode[] {
  const root: FileTreeNode = {
    name: "root",
    relativePath: "",
    type: "folder",
    children: [],
  };

  for (const file of files) {
    const parts = file.relativePath.split("/");
    let currentElement = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLastPart = i === parts.length - 1;
      const runningPath = parts.slice(0, i + 1).join("/");

      let targetNode = currentElement.children.find((child) => child.name === part);

      if (!targetNode) {
        targetNode = {
          name: part,
          relativePath: runningPath,
          type: isLastPart ? "file" : "folder",
          ...(isLastPart && {
            extension: file.extension,
            size: file.size,
            summaryStatus: file.summaryStatus,
          }),
          children: [],
        };
        
        (currentElement.children as FileTreeNode[]).push(targetNode);
      }

      currentElement = targetNode;
    }
  }

  const sortTreeNodes = (nodes: FileTreeNode[]): FileTreeNode[] => {
    return nodes
      .map((node) => ({
        ...node,
        children: node.children.length > 0 ? sortTreeNodes(node.children as FileTreeNode[]) : [],
      }))
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "folder" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
  };

  return sortTreeNodes(root.children as FileTreeNode[]);
}