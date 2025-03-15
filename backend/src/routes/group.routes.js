import express from 'express'

import { protectRoute } from '../middleware/auth.middleware.js'
import { addUserToGroup, createGroup, updateGroupInfo, leaveGroup, getGroups } from '../controllers/group.controller.js'

const router = express.Router()

router.get('/getGroups', protectRoute, getGroups)
router.post('/create', protectRoute, createGroup)
router.post('/addUser', protectRoute, addUserToGroup)
router.post('/leave', protectRoute, leaveGroup)
router.put('/update-group-info', protectRoute, updateGroupInfo)

export default router;