import { Router } from "express";
import AdminController from "../controllers/admin.controller.js";
import constants from "../config/constants.js";
import { validateUploadAssignment } from "../middlewares/joi.js";
import { verifyUserOnly, verifyToken, verifyAdminOnly } from "../middlewares/auth.middleware.js";

const router = Router();
const adminController = new AdminController();

router.get("/assignments", verifyToken,verifyAdminOnly(constants.admin),adminController.fetchAllAssignments);

export default router;