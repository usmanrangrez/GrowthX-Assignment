import mongoose from "mongoose";
import Logger from "./winston.js";

const logger = new Logger();

class MongoConnection {
  static instance;

  constructor() {
    if (MongoConnection.instance) {
      return MongoConnection.instance;
    }

    this.mongoConfig = {
      uri: process.env.MONGO_URI,
    };

    this.retries = 0;
    this.maxRetries = 5;

    MongoConnection.instance = this;
  }

  async connect() {
    if (this.connection) {
      return this.connection;
    }

    try {
      this.connection = await mongoose.connect(this.mongoConfig.uri);
      logger.info(
        `Connected to MongoDB successfully ${this.connection?.connections[0]?.host}`
      );
      return this.connection;
    } catch (error) {
      this.retries += 1;
      logger.error(
        `MongoDB connection attempt ${this.retries} failed: ${error.message}`
      );

      if (this.retries < this.maxRetries) {
        logger.warn(
          `Retrying MongoDB connection in 5 seconds (Attempt ${this.retries}/${this.maxRetries})...`
        );
        setTimeout(() => this.connect(), 5000);
      } else {
        logger.error("Max retry attempts reached. Exiting process.");
        process.exit(1);
      }
    }
  }
}

export default MongoConnection;
