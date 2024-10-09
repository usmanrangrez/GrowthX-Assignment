import { Router } from "express";
import AdminController from "../controllers/admin.controller.js";
import constants from "../config/constants.js";
import { validateUpdateassignment, validateUploadAssignment } from "../middlewares/joi.js";
import { verifyToken, verifyAdminOnly } from "../middlewares/auth.middleware.js";

const router = Router();
const adminController = new AdminController();

router.get("/assignments", verifyToken,verifyAdminOnly(constants.admin),adminController.fetchAllAssignments);
router.patch("/assignment/:id", verifyToken, verifyAdminOnly(constants.admin), validateUpdateassignment, adminController.updateAssignmentStatus);
router.get("/assignment/:id", verifyToken, verifyAdminOnly(constants.admin), adminController.downloadAssignment);

export default router;