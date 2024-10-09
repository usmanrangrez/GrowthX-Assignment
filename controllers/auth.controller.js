import { Codes } from "../config/codes.js";
import constants from "../config/constants.js";
import AuthService from "../services/auth.service.js";

class AuthController {
    constructor() {
        this.authService = new AuthService()
    }

    register = async (req, res) => {
        try {
            const { username, email, password, role } = req.body;
            const newUser = await this.authService.register(username, email, password, role)

            res.status(201).json({ message: Codes.GRX0001, data:{user: newUser} });
        } catch (error) {
            res.status(500).json({ message: Codes.GRX0002, error: error.message });
        }
    }

    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            const { username, accessToken, refreshToken } = await this.authService.login(email, password)

            res.status(200).json({ message: Codes.GRX0004, data:{username, accessToken, refreshToken} });
        } catch (error) {
            res.status(500).json({ message: Codes.GRX0005, error: error.message });
        }
    }

    refresh = async (req, res) => {
        try {
            const refreshToken = req.headers[constants.refreshTokenHeaderKey];
            const { newAccessToken, newRefreshToken } = await this.authService.refresh(refreshToken)

            res.status(200).json({ message: Codes.GRX0010, data:{accessToken: newAccessToken, refreshToken: newRefreshToken} });
        } catch (error) {
            res.status(500).json({ message: Codes.GRX0011, error: error.message });
        }
    }

    logout = async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(' ').pop();
            const refreshToken = req.headers[constants.refreshTokenHeaderKey];

            await this.authService.logout(accessToken,refreshToken)

            res.status(200).json({ message: Codes.GRX0012,data:{}  });
        } catch (error) {
            res.status(500).json({ message: Codes.GRX0013, error: error.message });
        }
    }
}

export default AuthController;
