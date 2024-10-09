import { Codes } from "../config/codes.js";
import AdminService from "../services/admin.service.js";


class UserController {
    constructor() {
        this.adminService = new AdminService()
    }

    fetchAllAssignments = async (req, res) => {
        try {
            const userId = req.user;
            const data = await this.adminService.fetchAllAssignments(userId)

            res.status(200).json({ message: Codes.GRX0031, data: { data } });
        } catch (error) {
            res.status(500).json({ message: Codes.GRX0032, error: error.message });
        }
    }




}

export default UserController;

