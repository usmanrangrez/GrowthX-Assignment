import "dotenv/config";
import express from "express";
import Logger from "./integrations/winston.js";
import RedisClient from "./integrations/redis.js";
import MongoConnection from "./integrations/database.js";
import rateLimitter from "./integrations/rateLimiter.js";
import router from "./routes/index.js";

const logger = new Logger();

class AppServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.redisClient = new RedisClient();
    this.mongooseClient = new MongoConnection();
    this.setupMiddlewares();
    this.setupRoutes();
    this.connectToRedis();
    this.connectToMongoose();
    this.startServer();
  }

  setupMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(rateLimitter);
  }

  async connectToRedis() {
    try {
      await this.redisClient.verifyConnection();
      logger.info("Successfully connected to redis!");
    } catch (error) {
      logger.error(`Failed to connect to redis: ${error?.message}`);
      throw new Error(`Redis error!: ${error?.message}`);
    }
  }

  async connectToMongoose() {
    try {
      await this.mongooseClient.connect();
    } catch (error) {
      logger.error(`MongoDB connection failed: ${error.message}`);
    }
  }

  setupRoutes() {
    this.app.use("/api", router);
  }

  startServer() {
    this.app.listen(this.port, () => {
      logger.info(`Server is running on port ${this.port}`);
    });
  }
}

new AppServer();
