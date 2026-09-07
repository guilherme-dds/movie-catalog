import { Router } from "express";
import { UserController } from "./controller/UserController.js";
import { FavoriteController } from "./controller/FavoriteController.js";
import { CommentController } from "./controller/CommentController.js";
import { AuthMiddleware, AdminMiddleware } from "./middlewares/auth.js";

const usercontroller = new UserController();
const favoritecontroller = new FavoriteController();
const commentcontroller = new CommentController();

export const router = Router();

// Users Routes
router.get("/users", AuthMiddleware, usercontroller.index);
router.get("/api/users", AuthMiddleware, usercontroller.index);





// Favorites Routes
router.post("/favorite", AuthMiddleware, favoritecontroller.store);
router.post("/api/favorite", AuthMiddleware, favoritecontroller.store);

router.get("/favorite", AuthMiddleware, favoritecontroller.favoriteList);
router.get("/api/favorite", AuthMiddleware, favoritecontroller.favoriteList);

router.delete("/favorite/:id", AuthMiddleware, favoritecontroller.delete);
router.delete("/api/favorite/:id", AuthMiddleware, favoritecontroller.delete);

// Comments Routes
router.get("/comment/admin/all", AuthMiddleware, AdminMiddleware, commentcontroller.allCommentsAdmin);
router.get("/api/comment/admin/all", AuthMiddleware, AdminMiddleware, commentcontroller.allCommentsAdmin);

router.post("/comment", AuthMiddleware, commentcontroller.store);
router.post("/api/comment", AuthMiddleware, commentcontroller.store);

router.delete("/comment/delete/:id", AuthMiddleware, commentcontroller.delete);
router.delete("/api/comment/delete/:id", AuthMiddleware, commentcontroller.delete);

router.get("/comment/:movieId", AuthMiddleware, commentcontroller.commentList);
router.get("/api/comment/:movieId", AuthMiddleware, commentcontroller.commentList);

