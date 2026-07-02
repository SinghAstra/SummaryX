import { z } from "zod";
import { fileSummaryStatusSchema } from "../../types";

export interface RepositoryTreeNode {
  name: string;
  relativePath: string;
  type: "file" | "folder";
  fileId?: string;
  extension?: string;
  size?: number;
  summaryStatus?: z.infer<typeof fileSummaryStatusSchema>;
  summary?: string | null;
  children: RepositoryTreeNode[];
}

export const repositoryTreeNodeSchema: z.ZodType<RepositoryTreeNode> = z.lazy(
  () =>
    z.object({
      name: z.string(),
      relativePath: z.string(),
      type: z.enum(["file", "folder"]),
      fileId: z.uuid().optional(),
      extension: z.string().optional(),
      size: z.number().int().nonnegative().optional(),
      summaryStatus: fileSummaryStatusSchema.optional(),
      summary: z.string().nullable().optional(),
      children: z.array(repositoryTreeNodeSchema),
    })
);

export const getRepositoryFilesResponseSchema = z.array(
  repositoryTreeNodeSchema
);

export type GetRepositoryFilesResponse = z.infer<
  typeof getRepositoryFilesResponseSchema
>;
