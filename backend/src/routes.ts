import { Router } from "express";
import multer from "multer";
import { UserController } from "./controller/UserController.js";
import { FavoriteController } from "./controller/FavoriteController.js";
import { CommentController } from "./controller/CommentController.js";
import { CustomListController } from "./controller/CustomListController.js";
import { StripeController } from "./controller/StripeController.js";
import { AuthMiddleware, AdminMiddleware } from "./middlewares/auth.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const usercontroller = new UserController();
const favoritecontroller = new FavoriteController();
const commentcontroller = new CommentController();
const customListController = new CustomListController();
const stripeController = new StripeController();

export const router = Router();

// Users Routes
router.get("/users", AuthMiddleware, usercontroller.index);
router.get("/api/users", AuthMiddleware, usercontroller.index);

router.get("/user/profile", AuthMiddleware, (req, res) => usercontroller.getProfile(req, res));
router.get("/api/user/profile", AuthMiddleware, (req, res) => usercontroller.getProfile(req, res));

router.put("/user/profile", AuthMiddleware, (req, res) => usercontroller.updateProfile(req, res));
router.put("/api/user/profile", AuthMiddleware, (req, res) => usercontroller.updateProfile(req, res));

// User Profile Avatar Routes (MinIO Upload & Serving)
router.post(
  "/user/avatar",
  AuthMiddleware,
  upload.single("avatar"),
  (req, res) => usercontroller.uploadAvatar(req, res)
);
router.post(
  "/api/user/avatar",
  AuthMiddleware,
  upload.single("avatar"),
  (req, res) => usercontroller.uploadAvatar(req, res)
);

router.get("/user/avatar/:filename", (req, res) => usercontroller.serveAvatar(req, res));
router.get("/api/user/avatar/:filename", (req, res) => usercontroller.serveAvatar(req, res));

router.delete("/user/avatar", AuthMiddleware, (req, res) => usercontroller.removeAvatar(req, res));
router.delete("/api/user/avatar", AuthMiddleware, (req, res) => usercontroller.removeAvatar(req, res));

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

// Custom Lists Routes (Premium feature)
router.post("/custom-list", AuthMiddleware, (req, res) => customListController.create(req, res));
router.post("/api/custom-list", AuthMiddleware, (req, res) => customListController.create(req, res));

router.get("/custom-list", AuthMiddleware, (req, res) => customListController.index(req, res));
router.get("/api/custom-list", AuthMiddleware, (req, res) => customListController.index(req, res));

router.post("/custom-list/:id/items", AuthMiddleware, (req, res) => customListController.addItem(req, res));
router.post("/api/custom-list/:id/items", AuthMiddleware, (req, res) => customListController.addItem(req, res));

router.delete("/custom-list/:id/items/:movieId", AuthMiddleware, (req, res) => customListController.removeItem(req, res));
router.delete("/api/custom-list/:id/items/:movieId", AuthMiddleware, (req, res) => customListController.removeItem(req, res));

router.delete("/custom-list/:id", AuthMiddleware, (req, res) => customListController.delete(req, res));
router.delete("/api/custom-list/:id", AuthMiddleware, (req, res) => customListController.delete(req, res));

// Stripe Routes
router.post("/stripe/create-checkout-session", AuthMiddleware, (req, res) => stripeController.createCheckoutSession(req, res));
router.post("/api/stripe/create-checkout-session", AuthMiddleware, (req, res) => stripeController.createCheckoutSession(req, res));

router.post("/stripe/verify-session", AuthMiddleware, (req, res) => stripeController.verifySession(req, res));
router.post("/api/stripe/verify-session", AuthMiddleware, (req, res) => stripeController.verifySession(req, res));

router.post("/stripe/webhook", (req, res) => stripeController.webhook(req, res));
router.post("/api/stripe/webhook", (req, res) => stripeController.webhook(req, res));

router.post("/stripe/mock-upgrade", AuthMiddleware, (req, res) => stripeController.mockUpgrade(req, res));
router.post("/api/stripe/mock-upgrade", AuthMiddleware, (req, res) => stripeController.mockUpgrade(req, res));

router.post("/stripe/cancel", AuthMiddleware, (req, res) => stripeController.cancelSubscription(req, res));
router.post("/api/stripe/cancel", AuthMiddleware, (req, res) => stripeController.cancelSubscription(req, res));
