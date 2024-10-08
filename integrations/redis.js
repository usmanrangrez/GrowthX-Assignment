import { Redis } from "ioredis";
import Logger from "./winston.js";

const logger = new Logger();

class RedisClient {
  static instance;

  constructor() {
    if (RedisClient.instance) {
      return RedisClient.instance;
    }

    this.redisConfig = {
      port: process.env.REDIS_PORT,
      host: process.env.REDIS_HOST,
      maxRetriesPerRequest: parseInt(process.env.MAX_REDIS_RETRIES),
      retryStrategy: (times) => {
        const delay = Math.min(1000 * Math.pow(2, times), 5000);
        return delay;
      },
    };

    this.client = new Redis(this.redisConfig);

    this.client.on("error", (error) => {
      logger.error(`Redis Error: ${error.message}`);
    });

    // Handle reconnect logic
    this.client.on("reconnecting", (delay) => {
      logger.warn(`Attempting to reconnect to Redis in ${delay} ms...`);
    });

    this.client = new Redis(this.redisConfig);
    RedisClient.instance = this;
    logger.silly("New redis instance created!");
  }

  async verifyConnection() {
    try {
      const result = await this.client.ping();
      logger.info(`Redis connection successful : ${result}`);
    } catch (error) {
      logger.error(`Redis connection failed :${error?.message}`);
      process.exit(1);
    }
  }
}

export default RedisClient;
