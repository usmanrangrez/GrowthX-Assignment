import rateLimit from "express-rate-limit";

const rateLimitter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
  message: "Too many requests from this IP, please try again after 15 minutes.",
  handler: (req, res, next) => {
    res.status(429).json({
      error:
        "You have exceeded the request limit. Please wait and try again later.",
    });
  },
});

export default rateLimitter;
