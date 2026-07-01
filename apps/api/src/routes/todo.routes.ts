import { createTodoSchema } from "@repo/shared";
import { Router } from "express";
import { todoController } from "../controllers/todo.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validation.middleware.js";

const router: Router = Router();

router.use(authMiddleware);

router.post("/", validateBody(createTodoSchema), todoController.createTodo);
router.get("/", todoController.listTodos);
router.put("/:id", todoController.updateTodo);
router.delete("/:id", todoController.deleteTodo);

export { router as todoRouter };
