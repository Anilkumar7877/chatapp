import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import cloudinary from '../lib/cloudinary.js'
import { generateToken } from '../lib/utils.js';
import Group from '../models/group.model.js';
import Channel from '../models/channel.model.js';

export const signup = async (req, res) => {
    const { email, fullName, password, uniqueId } = req.body;
    try {
        if (!email || !fullName || !password || !uniqueId) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const existingUniqueId = await User.findOne({ uniqueId });
        if (existingUniqueId) {
            return res.status(400).json({ message: 'Unique ID already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            fullName,
            uniqueId,
            password: hashedPassword
        });

        if (newUser) {
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({ message: 'User created successfully' });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) return res.status(400).json({ message: 'Invalid credentials' });

        generateToken(user._id, res)

        const groups = await Group.find({ members: user._id }).select('_id');
        const channels = await Channel.find({ members: user._id }).select('_id');

        // Update the user's groupsJoined and channelsJoined fields
        user.groupsJoined = groups.map(group => group._id);
        user.channelsJoined = channels.map(channel => channel._id);

        res.status(200).json({
            fullName: user.fullName,
            _id: user._id,
            email: user.email,
            profilePic: user.profilePic,
        })

    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
};

export const logout = async (req, res) => {
    try {
        res.cookie('jwt', '', { maxAge: 0 })
        res.status(200).json({ message: "Logged out successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) return res.status(400).json({ message: "Profile pic is required." })

        const uploadResponse = await cloudinary.uploader.upload(profilePic)

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        )

        res.status(200).json(updatedUser)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const checkAuth = async (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const updateUserStoryPrivacy = async (req, res) => {
    try {
        const { selectedUsers } = req.body;
        const user = await User.findById(req.user._id).populate('privateChats.id');

        // Get all privateChats IDs
        const privateChatIds = user.privateChats.map(chat => chat.id._id.toString());

        // Filter out selectedUsers from privateChats
        const storyVisibleTo = privateChatIds.filter(id => !selectedUsers.includes(id));

        user.storyVisibleTo = storyVisibleTo;
        await user.save();

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update story privacy settings' });
    }
};
