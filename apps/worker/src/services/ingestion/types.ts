export interface CollectedFile {
  relativePath: string;
  extension: string;
  size: number;
  hash: string;
}

export interface TraversalStats {
  totalFiles: number;
  supportedFiles: number;
  ignoredFiles: number;
  totalFolders: number;
  totalSize: bigint;
  collectedFiles: CollectedFile[];
}
