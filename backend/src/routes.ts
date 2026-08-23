import { Router } from "express";
import { UserController } from "./controller/UserController.js";
import { AuthController } from "./controller/AuthController.js";
import { FavoriteController } from "./controller/FavoriteController.js";
import { CommentController } from "./controller/CommentController.js";
import { AuthMiddleware } from "./middlewares/auth.js";

const usercontroller = new UserController();
const favoritecontroller = new FavoriteController();
const commentcontroller = new CommentController();
const authcontroller = new AuthController();

export const router = Router();

// Users & Auth Routes
router.get("/users", AuthMiddleware, usercontroller.index);
router.get("/api/users", AuthMiddleware, usercontroller.index);

router.post("/create", usercontroller.store);
router.post("/api/create", usercontroller.store);

router.post("/auth", authcontroller.authenticate);
router.post("/api/auth", authcontroller.authenticate);

router.post("/auth/refresh", authcontroller.refresh);
router.post("/api/auth/refresh", authcontroller.refresh);

router.post("/auth/reset", authcontroller.reset);
router.post("/api/auth/reset", authcontroller.reset);

router.post("/auth/reset/confirm", authcontroller.resetConfirm);
router.post("/api/auth/reset/confirm", authcontroller.resetConfirm);




// Favorites Routes
router.post("/favorite", AuthMiddleware, favoritecontroller.store);
router.post("/api/favorite", AuthMiddleware, favoritecontroller.store);

router.get("/favorite", AuthMiddleware, favoritecontroller.favoriteList);
router.get("/api/favorite", AuthMiddleware, favoritecontroller.favoriteList);

router.delete("/favorite/:id", AuthMiddleware, favoritecontroller.delete);
router.delete("/api/favorite/:id", AuthMiddleware, favoritecontroller.delete);

// Comments Routes
router.post("/comment", AuthMiddleware, commentcontroller.store);
router.post("/api/comment", AuthMiddleware, commentcontroller.store);

router.delete("/comment/delete/:id", AuthMiddleware, commentcontroller.delete);
router.delete("/api/comment/delete/:id", AuthMiddleware, commentcontroller.delete);

router.get("/comment/:movieId", AuthMiddleware, commentcontroller.commentList);
router.get("/api/comment/:movieId", AuthMiddleware, commentcontroller.commentList);
