import { Router } from "express";
import { repositoryController } from "../controllers/repo.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const repoRouter: Router = Router();

repoRouter.use(authMiddleware);

repoRouter.post("/", repositoryController.ingest);
repoRouter.get("/:id/files", repositoryController.getFiles);
repoRouter.get("/:id", repositoryController.getRepository);
repoRouter.get("/", repositoryController.getRepositories);
