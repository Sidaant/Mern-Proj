"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jwt_1 = require("../utils/jwt");
const User_1 = require("../models/User");
const logger_1 = require("../config/logger");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        const user = await User_1.User.findById(decoded.userId).select('-password -refreshTokens');
        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.user = {
            id: user._id.toString(),
            email: user.email
        };
        next();
    }
    catch (error) {
        logger_1.logger.error('Auth middleware error:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
};
exports.authenticateToken = authenticateToken;
//# sourceMappingURL=auth.js.map