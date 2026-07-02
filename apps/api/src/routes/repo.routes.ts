import { Router } from "express";
import { repositoryController } from "../controllers/repo.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const repoRouter: Router = Router();

repoRouter.post("/", authMiddleware, repositoryController.ingest);
repoRouter.get("/:id/files", authMiddleware, repositoryController.getFiles);
