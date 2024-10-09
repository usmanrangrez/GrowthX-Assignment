import { fileURLToPath } from "url";
import { Codes } from "../config/codes.js";
import fs from 'fs';
import AdminService from "../services/admin.service.js";
import path from 'path';
import { dirname } from 'path';
import constants from "../config/constants.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
class UserController {
    constructor() {
        this.adminService = new AdminService();
    }

    fetchAllAssignments = async (req, res) => {
        try {
            const { userId } = req.user;
            const data = await this.adminService.fetchAllAssignments(userId);

            res.status(200).json({ message: Codes.GRX0031, data });
        } catch (error) {
            res.status(500).json({ message: Codes.GRX0032, error: error.message });
        }
    }

    updateAssignmentStatus = async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const { userId } = req.user;
            const result = await this.adminService.updateAssignmentStatus(id, status, userId);
            res.status(result.status).json(result.data);
        } catch (error) {
            res.status(500).json({ message: Codes.GRX0032, error: error.message });
        }
    }

    downloadAssignment = async (req, res) => {
        try {
            const { id } = req.params;
            const { userId } = req.user;
            const result = await this.adminService.downloadAssignment(id, userId);

            if (result.status === 200) {
                const filePath = path.join(__dirname, '..', result.data.filePath);
                res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
                res.setHeader('Content-Type', constants.allowedFileType[0]);
                const fileStream = fs.createReadStream(filePath);
                fileStream.pipe(res);

                fileStream.on('error', (err) => {
                    logger.error(err.message);
                    return res.status(500).json({ message: Codes.GRX0032, error: err.message });
                });
            } else {
                res.status(result.status).json(result.data);
            }
        } catch (error) {
            res.status(500).json({ message: Codes.GRX0032, error: error.message });
        }
    }
}

export default UserController;