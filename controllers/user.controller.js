import { Codes } from "../config/codes.js";
import UserService from "../services/user.service.js";


class UserController {
    constructor() {
        this.userService = new UserService()
    }

    fetchAllAdmins = async (req, res) => {
        try {
            const data = await this.userService.fetchAllAdmins()

            res.status(200).json({ message: Codes.GRX0018, data: { data } });
        } catch (error) {
            res.status(500).json({ message: Codes.GRX0019, error: error.message });
        }
    }

    uploadAssignment = async (req, res) => {
        try {
            if (!req.file || req.file.length === 0) {
                return res.status(400).json({ message: Codes.GRX0025 });
            }
            const file =req.file;

            const { title, description, admin, task } = req.body;
            const user = req.user;

            const data = await this.userService.uploadAssignment(title,description,admin,task,user,file);

            res.status(200).json({ message: Codes.GRX0022, data });
        } catch (error) {
            res.status(500).json({ message: Codes.GRX0023, error: error.message });
        }
    }


}

export default UserController;

