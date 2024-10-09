import { Router } from "express";
import authRoutes from './auth.routes.js'

const router = Router();

router.get("/test", (req, res) => res.send("Hi"));


router.use("/v1", authRoutes);

export default router;
