import express from 'express';
import { updateUserStoryPrivacy } from '../controllers/user.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.put('/story-privacy', protectRoute, updateUserStoryPrivacy);

export default router;
