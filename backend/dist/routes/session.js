"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sessionController_1 = require("../controllers/sessionController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const validation_2 = require("../utils/validation");
const router = (0, express_1.Router)();
// All session routes require authentication
router.use(auth_1.authenticateToken);
router.post('/', (0, validation_1.validate)(validation_2.createSessionSchema), sessionController_1.createSession);
router.get('/', sessionController_1.getSessions);
router.get('/:sessionId', sessionController_1.getSession);
exports.default = router;
//# sourceMappingURL=session.js.map