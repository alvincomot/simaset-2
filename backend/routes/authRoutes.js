import express from "express";
import { login, forgotPassword, resetPassword, register, verifyEmail } from "../controllers/authController.js";

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
