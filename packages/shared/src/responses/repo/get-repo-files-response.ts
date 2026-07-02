import { z } from "zod";
import { repositoryFileDataSchema } from "../../types";

export const getRepositoryFilesResponseSchema = z.array(
  repositoryFileDataSchema
);

export type GetRepositoryFilesResponse = z.infer<
  typeof getRepositoryFilesResponseSchema
>;
