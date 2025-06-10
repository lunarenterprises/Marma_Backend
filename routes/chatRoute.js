const express = require('express');
const router = express.Router();

const { GetChatId, SendMessage, ListAllMessages } = require('../controllers/users/chat')

router.post('/create', GetChatId)
router.post('/messages', ListAllMessages)
router.post('/send_message', SendMessage)

module.exports = router