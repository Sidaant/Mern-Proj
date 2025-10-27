"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const Quiz_1 = require("../models/Quiz");
const logger_1 = require("../config/logger");
dotenv_1.default.config();
const seedData = async () => {
    try {
        await (0, database_1.connectDB)();
        // Create a sample host user
        const hostEmail = 'host@quizsync.com';
        const hostPassword = 'password123';
        let host = await User_1.User.findOne({ email: hostEmail });
        if (!host) {
            host = new User_1.User({
                email: hostEmail,
                password: hostPassword
            });
            await host.save();
            logger_1.logger.info('Sample host created:', hostEmail);
        }
        // Create a sample quiz
        const sampleQuiz = {
            title: 'JavaScript Fundamentals',
            description: 'Test your knowledge of JavaScript basics',
            hostId: host._id,
            questions: [
                {
                    text: 'What is the correct way to declare a variable in JavaScript?',
                    options: [
                        'var name = "John"',
                        'variable name = "John"',
                        'v name = "John"',
                        'declare name = "John"'
                    ],
                    correctIndex: 0,
                    timerSec: 30
                },
                {
                    text: 'Which method is used to add an element to the end of an array?',
                    options: [
                        'array.push()',
                        'array.add()',
                        'array.append()',
                        'array.insert()'
                    ],
                    correctIndex: 0,
                    timerSec: 25
                },
                {
                    text: 'What does the "===" operator do in JavaScript?',
                    options: [
                        'Assigns a value',
                        'Compares values and types',
                        'Compares only values',
                        'Checks if a variable exists'
                    ],
                    correctIndex: 1,
                    timerSec: 20
                },
                {
                    text: 'Which keyword is used to declare a function in JavaScript?',
                    options: [
                        'function',
                        'def',
                        'func',
                        'declare'
                    ],
                    correctIndex: 0,
                    timerSec: 15
                },
                {
                    text: 'What is the result of typeof null in JavaScript?',
                    options: [
                        'null',
                        'undefined',
                        'object',
                        'string'
                    ],
                    correctIndex: 2,
                    timerSec: 35
                }
            ]
        };
        const existingQuiz = await Quiz_1.Quiz.findOne({ title: sampleQuiz.title, hostId: host._id });
        if (!existingQuiz) {
            const quiz = new Quiz_1.Quiz(sampleQuiz);
            await quiz.save();
            logger_1.logger.info('Sample quiz created:', quiz.title);
        }
        logger_1.logger.info('Seed data created successfully!');
        logger_1.logger.info('Sample host credentials:');
        logger_1.logger.info('Email: host@quizsync.com');
        logger_1.logger.info('Password: password123');
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error('Seed error:', error);
        process.exit(1);
    }
};
seedData();
//# sourceMappingURL=seed.js.map