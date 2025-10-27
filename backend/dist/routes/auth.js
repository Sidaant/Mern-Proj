"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validation_1 = require("../middleware/validation");
const validation_2 = require("../utils/validation");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
// Rate limiting for auth routes
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later'
});
router.post('/register', authLimiter, (0, validation_1.validate)(validation_2.registerSchema), authController_1.register);
router.post('/login', authLimiter, (0, validation_1.validate)(validation_2.loginSchema), authController_1.login);
router.post('/refresh', (0, validation_1.validate)(validation_2.refreshTokenSchema), authController_1.refresh);
router.post('/logout', (0, validation_1.validate)(validation_2.refreshTokenSchema), authController_1.logout);
exports.default = router;
//# sourceMappingURL=auth.js.map