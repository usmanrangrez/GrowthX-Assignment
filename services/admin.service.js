import { Codes } from "../config/codes.js";
import constants from "../config/constants.js";
import Logger from "../integrations/winston.js";
import Assignment from "../models/assignment.model.js";
import User from "../models/user.model.js";

const logger = new Logger();
class AdminService {
    constructor() {
        this.user = User;
        this.assignment = Assignment;
    }
    async fetchAllAssignments(userId) {
        try {
            const { username } = await this.user.findById(userId);

            if(!username){
                throw new Error(Codes.GRX0033)
            };

            const assignments = await this.assignment.find({ admin:username });
            
            logger.info(Codes.GRX0031)
            return assignments;
        } catch (error) {
            logger.error(error.message);
            throw error;
        }
    }


}

export default AdminService;