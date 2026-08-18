import { Router } from "express";
import { UserController } from "./controller/UserController.js";

const usercontroller = new UserController();

export const router = Router();

router.get("/users", usercontroller.index);
router.post("/create", usercontroller.store);
