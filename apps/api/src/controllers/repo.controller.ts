import { AUTH_ERROR_CODES, ingestRepoSchema } from "@repo/shared";
import { type NextFunction, type Request, type Response } from "express";
import z from "zod";
import { UnauthorizedError } from "../errors/api-errors.js";
import { repositoryService } from "../services/repo.service.js";
import { successResponse } from "../utils/response.js";

export const repositoryController = {
  ingest: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validatedInput = ingestRepoSchema.parse(req.body);

      if (!req.user) {
        throw new UnauthorizedError(
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
          "Please sign in to continue."
        );
      }

      const responseData = await repositoryService.createRepository({
        userId: req.user.id,
        githubUrl: validatedInput.githubUrl,
      });

      console.log("responseData is ", responseData);

      res.status(201).json(successResponse(responseData));
    } catch (error) {
      next(error);
    }
  },

  getFiles: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = z.string().parse(req.params.id);

      if (!req.user) {
        throw new UnauthorizedError(
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
          "Please sign in to continue."
        );
      }

      const files = await repositoryService.getRepositoryFiles(id, req.user.id);

      res.status(200).json(successResponse(files));
    } catch (error) {
      next(error);
    }
  },

  async getRepository(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = z.string().parse(req.params.id);

      if (!req.user) {
        throw new UnauthorizedError(
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
          "Please sign in to continue."
        );
      }

      const repository = await repositoryService.getRepositoryDetail(
        id,
        req.user.id
      );

      res.status(200).json(repository);
    } catch (error) {
      next(error);
    }
  },
};
