import { Router } from "express";
import { AuthController } from "./controller/AuthController.js";
import { ResetController } from "./controller/ResetController.js";

const authController = new AuthController();
const resetController = new ResetController();

export const router = Router();

// User Registration
router.post("/create", (req, res) => authController.create(req, res));
router.post("/api/create", (req, res) => authController.create(req, res));
router.post("/auth/create", (req, res) => authController.create(req, res));

// Auth & Session
router.post("/auth", (req, res) => authController.authenticate(req, res));
router.post("/api/auth", (req, res) => authController.authenticate(req, res));
router.post("/auth/authenticate", (req, res) => authController.authenticate(req, res));
router.post("/authenticate", (req, res) => authController.authenticate(req, res));

router.post("/auth/refresh", (req, res) => authController.refresh(req, res));
router.post("/api/auth/refresh", (req, res) => authController.refresh(req, res));
router.post("/refresh", (req, res) => authController.refresh(req, res));

router.post("/auth/verify", (req, res) => authController.verify(req, res));
router.post("/api/auth/verify", (req, res) => authController.verify(req, res));
router.post("/verify", (req, res) => authController.verify(req, res));

// Password Reset
router.post("/auth/reset", (req, res) => resetController.reset(req, res));
router.post("/api/auth/reset", (req, res) => resetController.reset(req, res));
router.post("/reset", (req, res) => resetController.reset(req, res));

router.post("/auth/reset/confirm", (req, res) => resetController.confirm(req, res));
router.post("/api/auth/reset/confirm", (req, res) => resetController.confirm(req, res));
router.post("/reset/confirm", (req, res) => resetController.confirm(req, res));

