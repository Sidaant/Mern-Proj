"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refresh = exports.login = exports.register = void 0;
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
const logger_1 = require("../config/logger");
const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check if user already exists
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        // Create new user
        const user = new User_1.User({ email, password });
        await user.save();
        // Generate tokens
        const { accessToken, refreshToken, tokenId } = (0, jwt_1.generateTokenPair)(user._id.toString(), user.email);
        // Store refresh token
        user.refreshTokens.push(tokenId);
        await user.save();
        logger_1.logger.info(`User registered: ${email}`);
        res.status(201).json({
            message: 'User registered successfully',
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                email: user.email
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user
        const user = await User_1.User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Generate tokens
        const { accessToken, refreshToken, tokenId } = (0, jwt_1.generateTokenPair)(user._id.toString(), user.email);
        // Store refresh token
        user.refreshTokens.push(tokenId);
        await user.save();
        logger_1.logger.info(`User logged in: ${email}`);
        res.json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                email: user.email
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token required' });
        }
        // Verify refresh token
        const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
        const user = await User_1.User.findById(decoded.userId);
        if (!user || !user.refreshTokens.includes(decoded.tokenId)) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }
        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken, tokenId } = (0, jwt_1.generateTokenPair)(user._id.toString(), user.email);
        // Remove old refresh token and add new one
        user.refreshTokens = user.refreshTokens.filter(token => token !== decoded.tokenId);
        user.refreshTokens.push(tokenId);
        await user.save();
        res.json({
            accessToken,
            refreshToken: newRefreshToken
        });
    }
    catch (error) {
        logger_1.logger.error('Token refresh error:', error);
        res.status(401).json({ error: 'Invalid refresh token' });
    }
};
exports.refresh = refresh;
const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
            const user = await User_1.User.findById(decoded.userId);
            if (user) {
                user.refreshTokens = user.refreshTokens.filter(token => token !== decoded.tokenId);
                await user.save();
            }
        }
        res.json({ message: 'Logout successful' });
    }
    catch (error) {
        logger_1.logger.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
};
exports.logout = logout;
//# sourceMappingURL=authController.js.map