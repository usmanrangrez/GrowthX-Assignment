import { Router } from "express";
import AuthController from "../controllers/auth.controller.js";
import { validateRegister,validateLogin } from "../middlewares/joi.js";

const router = Router();
const authController = new AuthController();

router.post("/register",validateRegister,authController.register)
router.post("/login",validateLogin,authController.login)
router.post("/refresh",authController.refresh)
router.post("/logout",authController.logout)


export default router;