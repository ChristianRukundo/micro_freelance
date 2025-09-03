import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
} from "../controllers/auth.controller";
import { validateRegister, validateLogin } from "../middleware/validators";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.get("/me", protect, getCurrentUser);

export default router;
