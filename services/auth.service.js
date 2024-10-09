import bcrypt from 'bcrypt';
import Logger from "../integrations/winston.js";
import jwt from 'jsonwebtoken';
import { Codes } from '../config/codes.js';
import RedisClient from '../integrations/redis.js';
import constants from '../config/constants.js';

const logger = new Logger();
const redisClient = new RedisClient();
class AuthService {
    constructor(userModel) {
        this.user = userModel;
    }

    async register(username, email, password, role) {
        try {
            const existingUser = await this.user.findOne({ email });

            if (existingUser) {
                logger.error(Codes.GRX0003)
                throw new Error(Codes.GRX0003);
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new this.user({
                username,
                email,
                password: hashedPassword,
                role
            });

            await newUser.save();
            logger.info(Codes.GRX0001)
            return newUser;
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

            const accessToken = this.generateToken(user._id, process.env.ACCESS_TOKEN_KEY, process.env.ACCESS_TOKEN_EXPIRY);
            const refreshToken = this.generateToken(user._id, process.env.REFRESH_TOKEN_KEY, process.env.REFRESH_TOKEN_EXPIRY);
            
            logger.info(Codes.GRX0004)
            return { accessToken, refreshToken };
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

            const newAccessToken = this.generateToken(payload.userId, process.env.ACCESS_TOKEN_KEY, process.env.ACCESS_TOKEN_EXPIRY);
            const currentTime = Math.floor(Date.now() / 1000);
            const refreshTokenExpiration = payload.exp;

            let newRefreshToken;
            const remainingTime = refreshTokenExpiration - currentTime;
            if (remainingTime < (refreshTokenExpiration / 2)) {
                newRefreshToken = this.generateToken(payload.userId, process.env.REFRESH_TOKEN_KEY, process.env.REFRESH_TOKEN_EXPIRY);
            }

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

            return;

        } catch (error) {
            logger.error(error.message)
            throw error;
        }
    }


    generateToken(userId, secret, expiresIn) {
        try {
            return jwt.sign({ userId }, secret, { expiresIn });
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