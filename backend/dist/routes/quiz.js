"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quizController_1 = require("../controllers/quizController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const validation_2 = require("../utils/validation");
const router = (0, express_1.Router)();
// All quiz routes require authentication
router.use(auth_1.authenticateToken);
router.post('/', (0, validation_1.validate)(validation_2.createQuizSchema), quizController_1.createQuiz);
router.get('/', quizController_1.getQuizzes);
router.get('/:quizId', quizController_1.getQuiz);
router.put('/:quizId', (0, validation_1.validate)(validation_2.updateQuizSchema), quizController_1.updateQuiz);
router.delete('/:quizId', quizController_1.deleteQuiz);
exports.default = router;
//# sourceMappingURL=quiz.js.map