import rateLimit from "express-rate-limit";
import { Codes } from "../config/codes.js";

const rateLimitter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
  message: Codes.GRX0021,
  handler: (req, res, next) => {
    res.status(429).json({
      error:
        Codes.GRX0021,
    });
  },
});

export default rateLimitter;
