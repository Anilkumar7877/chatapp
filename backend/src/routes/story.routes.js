import express from 'express';
import { uploadStory, fetchStories, markStoryAsSeen, fetchStoryViewers } from '../controllers/story.controller.js';
import { upload, getFilePath } from '../lib/multer.js'
import { protectRoute } from '../middleware/auth.middleware.js'

const router = express.Router();

router.post('/upload', protectRoute, upload.single('file'), uploadStory);
router.get('/', protectRoute, fetchStories);
router.post('/:storyId/seen', protectRoute, markStoryAsSeen);
router.get('/:storyId/viewers', protectRoute, fetchStoryViewers);

export default router;