import { AUTH_ERROR_CODES } from "@repo/shared";
import { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { UnauthorizedError } from "../errors/api-errors.js";
import { todoService } from "../services/todo.service.js";

export const todoController = {
  createTodo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError(
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
          "Session credentials missing. Please sign in again."
        );
      }

      const responseData = await todoService.createTodo(req.user.id, req.body);

      res.status(201).json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      next(error);
    }
  },

  listTodos: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError(
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
          "Session credentials missing. Please sign in again."
        );
      }

      const responseData = await todoService.listTodos(req.user.id);

      res.status(200).json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      next(error);
    }
  },

  updateTodo: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError(
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
          "Session credentials missing. Please sign in again."
        );
      }

      const id = z.string().parse(req.params.id);

      const responseData = await todoService.updateTodo(
        req.user.id,
        id,
        req.body
      );

      res.status(200).json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteTodo: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError(
          AUTH_ERROR_CODES.INVALID_CREDENTIALS,
          "Session credentials missing. Please sign in again."
        );
      }

      const id = z.string().parse(req.params.id);
      const responseData = await todoService.deleteTodo(req.user.id, id);

      res.status(200).json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      next(error);
    }
  },
};
