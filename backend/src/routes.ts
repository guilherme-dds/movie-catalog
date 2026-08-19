import { Router } from "express";
import { UserController } from "./controller/UserController.js";
import { AuthController } from "./controller/AuthController.js";
import { FavoriteController } from "./controller/FavoriteController.js";
import { AuthMiddleware } from "./middlewares/auth.js";

const usercontroller = new UserController();
const favoritecontroller = new FavoriteController();
const authcontroller = new AuthController();

export const router = Router();

router.get("/users", AuthMiddleware, usercontroller.index);
router.post("/create", usercontroller.store);
router.post("/auth", authcontroller.authenticate);
router.post("/api/favorite", AuthMiddleware, favoritecontroller.store);
router.get("/api/favorite", AuthMiddleware, favoritecontroller.favoriteList);
router.delete("/api/favorite/:id", AuthMiddleware, favoritecontroller.delete);
