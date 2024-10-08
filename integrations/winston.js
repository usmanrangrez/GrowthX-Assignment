import winston from "winston";
import constants from "../config/constants.js";

const { combine, timestamp, json, colorize, simple } = winston.format;

class Logger {
  static instance;

  constructor() {
    if (Logger.instance) {
      return Logger.instance;
    }

    this.logger = winston.createLogger({
      level: "info",
      format: combine(
        timestamp({
          format: "YYYY-MM-DD HH:mm:ss.SSS A", // Correct format string with a space between date and time
        }),
        json() // Use json() as a function to create a format instance
      ),
      transports: [
        new winston.transports.File({ filename: "error.log", level: "error" }),
        new winston.transports.File({ filename: "combined.log" }),
      ],
    });

    // Add console transport only if not in production
    if (process.env.NODE_ENV !== constants.prod) {
      this.logger.add(
        // Use this.logger instead of logger
        new winston.transports.Console({
          format: combine(
            colorize(),
            timestamp({
              format: "YYYY-MM-DD HH:mm:ss.SSS A",
            }),
            simple()
          ),
        })
      );
    }

    Logger.instance = this;
  }

  log(level, message) {
    this.logger.log({ level, message });
  }

  info(message) {
    this.logger.info(message);
  }

  error(message) {
    this.logger.error(message);
  }

  warn(message) {
    this.logger.warn(message);
  }

  debug(message) {
    this.logger.debug(message);
  }

  silly(message) {
    this.logger.silly(message);
  }
}

export default Logger;
