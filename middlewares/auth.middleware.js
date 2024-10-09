import jwt from 'jsonwebtoken';
import { Codes } from '../config/codes.js';

const verifyToken = (req, res, next) => {
    const accessToken = req.headers['authorization']?.split(' ')[1];

    if (!accessToken) {
        return res.status(403).json({ message: Codes.GRX0026 });
    }
    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY);
        req.user = decoded;
    } catch (err) {
        return res.status(401).json({ message: 'Invalid Token' });
    }
    return next();
};

const verifyAdminOnly = (adminRole) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== adminRole) {
            return res.status(403).json({ message: Codes.GRX0028 });
        }
        next();
    };
};

const verifyUserOnly = (userRole) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== userRole) {
            return res.status(403).json({ message: Codes.GRX0027 });
        }
        next();
    };
};



export { verifyAdminOnly, verifyUserOnly, verifyToken };
