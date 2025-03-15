import express from 'express'

import { protectRoute } from '../middleware/auth.middleware.js'
import { getUsersForSidebar, getMessages, sendMessages, documentUpload, markMessagesAsRead, searchUserByUniqueId } from '../controllers/message.controller.js'

import { upload, getFilePath } from '../lib/multer.js'
const router = express.Router()

router.get('/users', protectRoute, getUsersForSidebar)
router.get('/:id', protectRoute, getMessages)
router.get('/search-Id/:uniqueId', protectRoute, searchUserByUniqueId)
router.post('/send/:id', protectRoute, sendMessages)
router.post('/upload', upload.single("file"), documentUpload)
router.put("/read/:chatId", protectRoute, markMessagesAsRead);

export default router;