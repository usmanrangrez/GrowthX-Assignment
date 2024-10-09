import bcrypt from 'bcrypt';
import Logger from "../integrations/winston.js";
import jwt from 'jsonwebtoken';
import { Codes } from '../config/codes.js';
import RedisClient from '../integrations/redis.js';
import constants from '../config/constants.js';
import User from "../models/user.model.js";

const logger = new Logger();
const redisClient = new RedisClient();
class AuthService {
    constructor() {
        this.user = User;
        this.bcryptSaltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    }

    async register(username, email, password, role) {
        try {
            const existingUser = await this.user.findOne({ email });

            if (existingUser) {
                logger.error(Codes.GRX0003)
                throw new Error(Codes.GRX0003);
            }

            const hashedPassword = await bcrypt.hash(password, this.bcryptSaltRounds);

            const newUser = new this.user({
                username,
                email,
                password: hashedPassword,
                role
            });

            await newUser.save();
            logger.info(Codes.GRX0001);
            const userWithoutPassword = newUser.toObject();
            delete userWithoutPassword.password; // Now you can safely delete the password
            return userWithoutPassword;
        } catch (error) {
            logger.error(error.message);
            throw error;
        }
    }

    async login(email, password) {
        try {
            const user = await this.user.findOne({ email });

            if (!user) {
                throw new Error(Codes.GRX0006);
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                logger.error(Codes.GRX0007)
                throw new Error(Codes.GRX0007);
            }

            const accessToken = this.generateToken({ userId: user._id, role: user.role }, process.env.ACCESS_TOKEN_KEY, process.env.ACCESS_TOKEN_EXPIRY);
            const refreshToken = this.generateToken({ userId: user._id, role: user.role }, process.env.REFRESH_TOKEN_KEY, process.env.REFRESH_TOKEN_EXPIRY);

            logger.info(Codes.GRX0004)
            return { username: user.username, accessToken, refreshToken };
        } catch (error) {
            logger.error(error.message);
            throw error;
        }
    }

    async refresh(refreshToken) {
        try {
            if (!refreshToken) {
                logger.error(Codes.GRX0008);
                throw new Error(Codes.GRX0008);
            }

            const payload = this.verifyToken(refreshToken, process.env.REFRESH_TOKEN_KEY);
            const isBlacklisted = await redisClient.get(refreshToken);
            if (isBlacklisted === constants.true) {
                logger.error(Codes.GRX0009);
                throw new Error(Codes.GRX0009);
            }

            const newAccessToken = this.generateToken({ userId: payload.userId, role: payload.role }, process.env.ACCESS_TOKEN_KEY, process.env.ACCESS_TOKEN_EXPIRY);
            const currentTime = Math.floor(Date.now() / 1000);
            const refreshTokenExpiration = payload.exp;

            const remainingTime = refreshTokenExpiration - currentTime;
            const newRefreshToken = (remainingTime < (refreshTokenExpiration / 2))
                ? this.generateToken({ userId: payload.userId, role: payload.role }, process.env.REFRESH_TOKEN_KEY, process.env.REFRESH_TOKEN_EXPIRY)
                : refreshToken;

            logger.info(Codes.GRX0010)

            return { newAccessToken: newAccessToken, newRefreshToken: newRefreshToken || refreshToken }
        } catch (error) {
            logger.error(error.message)
            throw error;
        }
    }

    async logout(accessToken, refreshToken) {

        if (!accessToken || !refreshToken) {
            logger.error(Codes.GRX0014);
            throw new Error(Codes.GRX0014)
        }

        try {
            const accessTokenPayload = this.verifyToken(accessToken, process.env.ACCESS_TOKEN_KEY);
            const refreshTokenPayload = this.verifyToken(refreshToken, process.env.REFRESH_TOKEN_KEY);

            if (accessTokenPayload.userId !== refreshTokenPayload.userId) {
                logger.error(Codes.GRX0017);
                throw new Error(Codes.GRX0017);
            }

            const currentTime = Math.floor(Date.now() / 1000);
            const accessTokenLife = accessTokenPayload.exp - currentTime;
            const refreshTokenLife = refreshTokenPayload.exp - currentTime;

            await redisClient.setex(accessToken, accessTokenLife, constants.true);
            await redisClient.setex(refreshToken, refreshTokenLife, constants.true);

            logger.info(Codes.GRX0012)

            return;

        } catch (error) {
            logger.error(error.message)
            throw error;
        }
    }


    generateToken(payload, secret, expiresIn) {
        try {
            return jwt.sign(payload, secret, { expiresIn });
        } catch (error) {
            logger.error(`${Codes.GRX0016} ${error.message}`);
            throw new Error(Codes.GRX0016);
        }
    }

    verifyToken(token, secret) {
        try {
            return jwt.verify(token, secret);
        } catch (error) {
            logger.error(`${Codes.GRX0015}: ${error.message}`);
            throw new Error(Codes.GRX0015);
        }
    }


}

export default AuthService;