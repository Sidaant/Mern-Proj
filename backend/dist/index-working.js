"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const logger_1 = require("./config/logger");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Connect to database
(0, database_1.connectDB)();
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
}));
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Simple test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'QuizSync API is working!' });
});
// Mock auth endpoints for testing
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'host@quizsync.com' && password === 'password123') {
        res.json({
            message: 'Login successful',
            accessToken: 'mock-token-123',
            user: {
                id: '1',
                email: 'host@quizsync.com'
            }
        });
    }
    else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});
app.post('/api/auth/register', (req, res) => {
    res.json({
        message: 'User registered successfully',
        accessToken: 'mock-token-123',
        user: {
            id: '1',
            email: req.body.email
        }
    });
});
// Mock quiz endpoints (no auth required for testing)
app.get('/api/quiz', (req, res) => {
    res.json([
        {
            id: '1',
            title: 'JavaScript Fundamentals',
            description: 'Test your JavaScript knowledge',
            questions: [
                {
                    text: 'What is JavaScript?',
                    options: ['A programming language', 'A database', 'A framework', 'An operating system'],
                    correctIndex: 0,
                    timerSec: 30
                }
            ]
        }
    ]);
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});
const PORT = 5001;
app.listen(PORT, () => {
    logger_1.logger.info(`Server running on port ${PORT}`);
    logger_1.logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
//# sourceMappingURL=index-working.js.map