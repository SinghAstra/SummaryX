import { type RepositoryFileData } from "@repo/shared";

export type TreeNodeType = "file" | "folder";

export interface TreeNode {
  name: string;
  type: TreeNodeType;
  path: string;
  children?: TreeNode[];
  fileData?: RepositoryFileData;
  extension?: string;
}

export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "";
  return filename.substring(lastDot);
}

export function getFileIcon(extension: string): string {
  const iconMap: Record<string, string> = {
    ".ts": "📄",
    ".tsx": "⚛️",
    ".js": "📜",
    ".jsx": "⚛️",
    ".json": "⚙️",
    ".css": "🎨",
    ".scss": "🎨",
    ".html": "🌐",
    ".md": "📝",
    ".py": "🐍",
    ".java": "☕",
    ".cpp": "⚙️",
    ".c": "⚙️",
    ".rs": "🦀",
    ".go": "🐹",
    ".rb": "💎",
    ".php": "🐘",
    ".sql": "🗄️",
    ".yaml": "📋",
    ".yml": "📋",
    ".xml": "📋",
    ".env": "🔐",
    ".gitignore": "🚫",
    ".txt": "📄",
  };

  return iconMap[extension] || "📄";
}

export function sortNodes(nodes: TreeNode[]): TreeNode[] {
  return nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "folder" ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

export function buildFileTree(files: RepositoryFileData[]): TreeNode[] {
  const root: TreeNode[] = [];
  const nodeMap = new Map<string, TreeNode>();

  files.forEach((file) => {
    const parts = file.relativePath.split("/");
    let currentPath = "";

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!nodeMap.has(currentPath)) {
        const isFile = index === parts.length - 1;
        const node: TreeNode = {
          name: part,
          type: isFile ? "file" : "folder",
          path: currentPath,
          ...(isFile && { fileData: file }),
          ...(isFile && { extension: file.extension }),
          ...(!isFile && { children: [] }),
        };

        nodeMap.set(currentPath, node);

        if (index === 0) {
          root.push(node);
        } else {
          const parentPath = currentPath.substring(
            0,
            currentPath.lastIndexOf("/")
          );
          const parent = nodeMap.get(parentPath);
          if (parent && parent.children) {
            (parent.children as TreeNode[]).push(node);
          }
        }
      }
    });
  });

  const sortRecursive = (nodes: TreeNode[]): void => {
    sortNodes(nodes).forEach((node) => {
      if (node.children) {
        sortRecursive(node.children as TreeNode[]);
      }
    });
  };

  sortRecursive(root);
  return sortNodes(root);
}
