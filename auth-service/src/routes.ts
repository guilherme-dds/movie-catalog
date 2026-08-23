import { Router } from "express";
import { AuthController } from "./controller/AuthController.js";

const authController = new AuthController();

export const router = Router();

router.post("/auth/authenticate", (req, res) => authController.authenticate(req, res));
router.post("/auth/refresh", (req, res) => authController.refresh(req, res));
router.post("/auth/verify", (req, res) => authController.verify(req, res));

router.post("/authenticate", (req, res) => authController.authenticate(req, res));
router.post("/refresh", (req, res) => authController.refresh(req, res));
router.post("/verify", (req, res) => authController.verify(req, res));
