import { Router } from "express";
import { UserController } from "./controller/UserController.js";
import { AuthController } from "./controller/AuthController.js";
import { AuthMiddleware } from "./middlewares/auth.js";

const usercontroller = new UserController();
const authcontroller = new AuthController();

export const router = Router();

router.get("/users", AuthMiddleware, usercontroller.index);
router.post("/create", usercontroller.store);
router.post("/auth", authcontroller.authenticate);
