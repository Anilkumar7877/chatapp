import Story from '../models/story.model.js';
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import User from '../models/user.model.js';

export const uploadStory = async (req, res) => {
    console.log("formdata is: ", req.body);
    try {
        const { path } = req.file;
        const { text, mediaType } = req.body;
        const userId = req.user._id;

        // Check if a story document already exists for the user
        let story = await Story.findOne({ createdBy: userId });

        if (story) {
            // Append new media to the existing document's media array
            story.media.push({
                text: text,
                url: path,
                type: mediaType || 'image', // Default to 'image' if mediaType is not provided
            });
            // story.text = text || story.text; // Update text if provided
        } else {
            // Create a new story document
            story = new Story({
                createdBy: userId,
                media: [{
                    text: text,
                    url: path,
                    type: mediaType || 'image', // Default to 'image' if mediaType is not provided
                }],
            });
        }

        await story.save();
        res.status(201).json(story);
    } catch (error) {
        console.log('Failed to upload story in controller: ', error);
        res.status(500).json({ error: 'Failed to upload story' });
    }
};

export const fetchStories = async (req, res) => {
    try {
        const authUserId = req.user._id;

        // Find users where the authUserId is in their storyVisibleTo array
        const usersWithVisibleStories = await User.find({ storyVisibleTo: authUserId }).select('_id');

        const visibleUserIds = usersWithVisibleStories.map(user => user._id);

        const stories = await Story.find({
            $or: [
                { createdBy: authUserId },
                { createdBy: { $in: visibleUserIds } }
            ]
        })
            .populate('createdBy', 'fullName profilePic storyVisibleTo')
            .populate('seenBy', 'fullName');

        const myStories = [];
        const recentStories = [];

        stories.forEach(story => {
            if (story.createdBy._id.toString() === authUserId.toString()) {
                myStories.push(story);
            } else {
                recentStories.push(story);
            }
        });
        res.status(200).json({ myStories, recentStories });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stories' });
    }
};

export const markStoryAsSeen = async (req, res) => {
    try {
        const { storyId } = req.params;
        const userId = req.user._id;

        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ error: 'Story not found' });
        }

        if (!story.seenBy.includes(userId)) {
            story.seenBy.push(userId);
            await story.save();
        }

        res.status(200).json(story);
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark story as seen' });
    }
};

export const fetchStoryViewers = async (req, res) => {
    try {
        const { storyId } = req.params;
        const story = await Story.findById(storyId).populate('seenBy', 'fullName profilePic');
        if (!story) {
            return res.status(404).json({ error: 'Story not found' });
        }
        res.status(200).json(story.seenBy);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch story viewers' });
    }
};