const express = require('express');
const { chatWithAI } = require('../controllers/chatController');

const router = express.Router();

// POST endpoint for chat (non-streaming)
router.post('/', chatWithAI);

module.exports = router; 