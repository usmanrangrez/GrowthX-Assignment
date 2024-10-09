import { Codes } from "../config/codes.js";
import constants from "../config/constants.js";
import Logger from "../integrations/winston.js";
import Assignment from "../models/assignment.model.js";
import User from "../models/user.model.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const logger = new Logger();

class AdminService {
    constructor() {
        this.user = User;
        this.assignment = Assignment;
    }

    async fetchAllAssignments(userId) {
        try {
            const user = await this.user.findById(userId);

            if (!user || !user.username) {
                throw new Error(Codes.GRX0033);
            }

            const assignments = await this.assignment.find({ admin: user.username });

            logger.info(Codes.GRX0031);
            return { assignments, length: assignments.length };
        } catch (error) {
            logger.error(error.message);
            throw error;
        }
    }

    async updateAssignmentStatus(id, status, userId) {
        if (![constants.accepted, constants.rejected].includes(status)) {
            return { status: 400, data: { message: Codes.GRX0037 } };
        }
    
        try {
            const admin = await this.user.findById(userId);
            if (!admin) {
                return { status: 404, data: { message: Codes.GRX0040} };
            }
    
            const assignment = await this.assignment.findById(id);
            if (!assignment) {
                return { status: 404, data: { message: Codes.GRX0039 } };
            }
    
            if (assignment.admin !== admin.username) {
                return { status: 403, data: { message: Codes.GRX0041 } };
            }

    
            const updatedAssignment = await this.assignment.findByIdAndUpdate(id, { status }, { new: true });
    
            return { status: 200, data: { message: Codes.GRX0038, assignment: updatedAssignment } };
        } catch (error) {
            logger.error(error.message);
            return { status: 500, data: { message: Codes.GRX0042, error: error.message } };
        }
    }
    
    async downloadAssignment(id, userId) {
        try {
            const admin = await this.user.findById(userId);
            if (!admin) {
                return { status: 404, data: { message: Codes.GRX0040 } };
            }
    
            const assignment = await this.assignment.findById(id);
            if (!assignment) {
                return { status: 404, data: { message: Codes.GRX0039 } }; 
            }
    
            if (assignment.admin !== admin.username) {
                return { status: 403, data: { message: Codes.GRX0041 } };
            }
    
            const filePath = path.join(constants.getFolder, assignment.filePath);
            if (!fs.existsSync(filePath)) {
                return { status: 404, data: { message: Codes.GRX0043 } }; 
            }
    
            return { 
                status: 200,
                data: {
                    message: Codes.GRX0044,
                    filePath
                }
            };

        } catch (error) {
            logger.error(error.message);
            return { status: 500, data: { message: Codes.GRX0032, error: error.message } };
        }
    }
}

export default AdminService;