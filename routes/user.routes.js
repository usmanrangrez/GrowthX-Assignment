import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import upload from "../middlewares/multer.js";
import constants from "../config/constants.js";
import { validateUploadAssignment } from "../middlewares/joi.js";
import { verifyUserOnly, verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();
const userController = new UserController();

router.get("/admins", userController.fetchAllAdmins);
router.post("/upload", verifyToken, verifyUserOnly(constants.user), upload(constants.file), validateUploadAssignment, userController.uploadAssignment);

export default router;