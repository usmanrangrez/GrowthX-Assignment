import { Codes } from "../config/codes.js";
import constants from "../config/constants.js";
import Logger from "../integrations/winston.js";
import Assignment from "../models/assignment.model.js";
import User from "../models/user.model.js";

const logger = new Logger();
class UserService {
    constructor() {
        this.user = User;
        this.assignment = Assignment;
    }
    async fetchAllAdmins() {
        try {
            const admins = await this.user.find({ role: constants.admin });

            if (!admins) {
                logger.error(`${Codes.GRX0020}`)
            }

            const adminNames = admins.map((admin) => admin?.username);
            logger.info(Codes.GRX0018)
            return adminNames;
        } catch (error) {
            logger.error(error.message);
            throw error;
        }
    }

    async uploadAssignment(title, description, adminName, task, user, file) {
        try {
            if (!user || !user.userId) {
                throw new Error(Codes.GRX0029);
            }
            const { username,role } = await this.user.findById(user.userId);

            if (role == constants.admin) {
                throw new Error(Codes.GRX0035)
            }
            const admin = await this.user.findOne({ username: adminName });
            if (!admin) {
                throw new Error(Codes.GRX0036)
            }
            if (admin.role !== constants.admin) {
                throw new Error(Codes.GRX0034)
            }

            const assignmentData = {
                user: username,
                admin: adminName,
                title: title,
                task: task,
                description: description,
                filePath: file.filename
            };

            const newAssignment = await this.assignment(assignmentData);
            await newAssignment.save();

            logger.info(`${Codes.GRX0022}`);
            return newAssignment;
        } catch (error) {
            logger.error(`${Codes.GRX0023}: ${error.message}`);
            throw error;
        }
    }
}

export default UserService;