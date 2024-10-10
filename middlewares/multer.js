import multer from 'multer';
import path from 'path';
import constants from '../config/constants.js';
import crypto from 'crypto';
import fs from 'fs';
import { Codes } from '../config/codes.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import User from '../models/user.model.js';

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
        // We'll set the filename later, after all fields are processed
        cb(null, file.originalname);
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

export default () => [
    (req, res, next) => {
        ensureUploadDirExists();
        upload.single(constants.file)(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ error: err.message });
            } else if (err) {
                return res.status(500).json({ error: err.message });
            }

            const { admin, title, task, description } = req.body;

            if (!admin || !title || !task || !description) {
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(400).json({
                    message: Codes.GRX0023,
                    error: "Missing required fields"
                });
            }

            try {
                const isAdminExist = await User.findOne({username: admin});
                if (!isAdminExist) {
                    if (req.file) {
                        fs.unlinkSync(req.file.path);
                    }
                    return res.status(400).json({
                        message: Codes.GRX0023,
                        error: Codes.GRX0036
                    });
                }

                if (req.file) {
                    const randomUUID = crypto.randomUUID();
                    const newFilename = `${admin}_${randomUUID}${path.extname(req.file.originalname)}`;
                    const newPath = path.join(path.dirname(req.file.path), newFilename);
                    fs.renameSync(req.file.path, newPath);
                    req.file.path = newPath;
                    req.file.filename = newFilename;
                }

                next();
            } catch (error) {
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(500).json({
                    message: Codes.GRX0023,
                    error: error.message
                });
            }
        });
    }
];