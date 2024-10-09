// middlewares/multer.js
import multer from 'multer';
import path from 'path';
import constants from '../config/constants.js'; 
import crypto from 'crypto';
import fs from 'fs';
import { Codes } from '../config/codes.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ensureUploadDirExists = () => {
    const uploadPath = path.join(__dirname, constants.uploadsFolder);
    fs.mkdirSync(uploadPath, { recursive: true });
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, constants.uploadsFolder);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const adminId = req.user.userId;
        const randomUUID = crypto.randomUUID();
        const customFileName = `${adminId}_${randomUUID}${path.extname(file.originalname)}`;
        cb(null, customFileName);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [constants.allowedFileType[0]];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(Codes.GRX0024), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: fileFilter
});

export default (fieldName) => (req, res, next) => {
    ensureUploadDirExists();
    upload.single(fieldName)(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: err.message });
        } else if (err) {
            return res.status(500).json({ error: err.message });
        }
        next();
    });
};