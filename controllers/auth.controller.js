import { Codes } from "../config/codes.js";
import constants from "../config/constants.js";
import User from "../models/user.model.js";
import AuthService from "../services/auth.service.js";

class AuthController {
    constructor() {
        this.userService = new AuthService(User)
    }

    register = async (req, res) => {
        try {
            const { username, email, password, role } = req.body;
            const newUser = await this.userService.register(username, email, password, role)

            res.status(201).json({ message: Codes.GRX0001, user: newUser });
        } catch (error) {
            res.status(500).json({ message: Codes.GRX0002, error: error.message });
        }
    }

    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            const { accessToken, refreshToken } = await this.userService.login(email, password)

            res.status(200).json({ message: Codes.GRX0004, accessToken, refreshToken });
        } catch (error) {
            res.status(500).json({ message: Codes.GRX0005, error: error.message });
        }
    }

    refresh = async (req, res) => {
        try {
            const refreshToken = req.headers[constants.refreshTokenHeaderKey];
            const { newAccessToken, newRefreshToken } = await this.userService.refresh(refreshToken)

            res.status(200).json({ message: Codes.GRX0010, accessToken: newAccessToken, refreshToken: newRefreshToken });
        } catch (error) {
            res.status(500).json({ message: Codes.GRX0011, error: error.message });
        }
    }

    logout = async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(' ').pop();
            const refreshToken = req.headers[constants.refreshTokenHeaderKey];

            await this.userService.logout(accessToken,refreshToken)

            res.status(200).json({ message: Codes.GRX0012,  });
        } catch (error) {
            res.status(500).json({ message: Codes.GRX0013, error: error.message });
        }
    }
}

export default AuthController;
