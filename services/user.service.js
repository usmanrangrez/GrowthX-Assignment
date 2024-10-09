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
           const admins = await this.user.find({role:constants.admin});

           if(!admins){
            logger.error(`${Codes.GRX0020}`)
           }

           const adminNames = admins.map((admin)=>admin?.username);
           logger.info(Codes.GRX0018)
           return adminNames;
        } catch (error) {
            logger.error(error.message);
            throw error;
        }
    }
}

export default UserService;