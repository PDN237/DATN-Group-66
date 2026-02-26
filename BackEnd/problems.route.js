const express = require('express');
const router = express.Router();
const problemsController = require('./controllers/Problems');

// GET /api/problems - Lấy tất cả problems
router.get('/', problemsController.getAllProblems);

// GET /api/problems/:id - Lấy problem theo id
router.get('/:id', problemsController.getProblemById);

module.exports = router;
