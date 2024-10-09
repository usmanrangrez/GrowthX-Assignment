import { Router } from "express";
import authRoutes from './auth.routes.js'
import userRoutes from './user.routes.js'

const router = Router();

router.get("/test", (req, res) => res.send("Hi"));


router.use("/auth", authRoutes);
router.use("/user", userRoutes);

export default router;
