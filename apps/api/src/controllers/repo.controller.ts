import { AUTH_ERROR_CODES, ingestRepoSchema } from "@repo/shared";
import { NextFunction, type Request, type Response } from "express";
import { UnauthorizedError } from "../errors/api-errors.js";
import { repositoryService } from "../services/repo.service.js";
import { successResponse } from "../utils/response.js";

export const repositoryController = {
  ingest: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedInput = ingestRepoSchema.parse(req.body);

      if (!req.user) {
        throw new UnauthorizedError(
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
          "Session credentials missing. Please sign in again."
        );
      }

      const responseData = await repositoryService.createRepository({
        userId: req.user.id,
        githubUrl: validatedInput.githubUrl,
      });

      res.status(201).json(successResponse(responseData));
    } catch (error) {
      next(error);
    }
  },
};
