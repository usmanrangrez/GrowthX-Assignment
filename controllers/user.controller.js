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
}

export default UserController;
