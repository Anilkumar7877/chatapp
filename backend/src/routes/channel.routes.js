import express from 'express'

import { protectRoute } from '../middleware/auth.middleware.js'
import { createChannel, getChannels, joinChannel, updateChannelInfo, leaveChannel } from '../controllers/channel.controller.js'

const router = express.Router()

router.post('/create', protectRoute, createChannel)
router.get('/list', protectRoute, getChannels)
router.post('/join/:channelId', protectRoute, joinChannel)
router.post('/leave/:channelId', protectRoute, leaveChannel);
router.put('/update-group-info', protectRoute, updateChannelInfo)

export default router;