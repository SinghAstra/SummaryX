import { prisma } from "@repo/db";
import {
  AUTH_ERROR_CODES,
  COMMON_ERROR_CODES,
  ingestRepoSchema,
} from "@repo/shared";
import { NextFunction, type Request, type Response } from "express";
import z from "zod";
import { NotFoundError, UnauthorizedError } from "../errors/api-errors.js";
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

      console.log("responseData is ", responseData);

      res.status(201).json(successResponse(responseData));
    } catch (error) {
      next(error);
    }
  },
  getFiles: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = z.string().parse(req.params.id);

      if (!req.user) {
        throw new UnauthorizedError(
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
          "Please sign in to continue."
        );
      }

      const repo = await prisma.repository.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      });

      if (!repo) {
        throw new NotFoundError(
          COMMON_ERROR_CODES.ROUTE_NOT_FOUND,
          "Repository not found."
        );
      }

      const files = await prisma.repositoryFile.findMany({
        where: { repositoryId: id },
        orderBy: { relativePath: "asc" },
      });

      res.status(200).json(successResponse(files));
    } catch (error) {
      next(error);
    }
  },
};
