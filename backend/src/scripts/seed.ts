import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import { User } from '../models/User';
import { Quiz } from '../models/Quiz';
import { logger } from '../config/logger';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Create a sample host user
    const hostEmail = 'host@quizsync.com';
    const hostPassword = 'password123';

    let host = await User.findOne({ email: hostEmail });
    if (!host) {
      host = new User({
        email: hostEmail,
        password: hostPassword
      });
      await host.save();
      logger.info('Sample host created:', hostEmail);
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

    const existingQuiz = await Quiz.findOne({ title: sampleQuiz.title, hostId: host._id });
    if (!existingQuiz) {
      const quiz = new Quiz(sampleQuiz);
      await quiz.save();
      logger.info('Sample quiz created:', quiz.title);
    }

    logger.info('Seed data created successfully!');
    logger.info('Sample host credentials:');
    logger.info('Email: host@quizsync.com');
    logger.info('Password: password123');
    
    process.exit(0);
  } catch (error) {
    logger.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
