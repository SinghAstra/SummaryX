import { z } from "zod";
import { repositoryDataSchema } from "../../schemas/repo.js";

export const getRepositoriesResponseSchema = z.array(repositoryDataSchema);

export type GetRepositoriesResponse = z.infer<
  typeof getRepositoriesResponseSchema
>;
