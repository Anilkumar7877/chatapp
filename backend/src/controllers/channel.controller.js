import Channel from "../models/channel.model.js";
import User from "../models/user.model.js";

export const createChannel = async (req, res) => {
    try {
        // console.log(req.body);
        const { channelName, channelDescription } = req.body;
        const channel = new Channel({
            name: channelName,
            description: channelDescription,
            admin: req.user._id,
            members: [req.user._id]
        });
        await channel.save();
        res.status(201).json(channel);
    } catch (error) {
        console.log("error ", error);
        res.status(500).json({ message: "Error creating channel" });
    }
};

export const getChannels = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch the user's channelsJoined array
        const user = await User.findById(userId).select('channelsJoined');
        const channelsJoined = user.channelsJoined;

        // Find all channels
        const allChannels = await Channel.find()
            .populate('admin', 'fullName')
            .populate('members', 'fullName');

        // Find channels that are in the user's channelsJoined array
        const followingChannels = allChannels.filter(channel => channelsJoined.includes(channel._id));

        res.status(200).json({
            allChannels,
            followingChannels
        });

    } catch (error) {
        console.log("Error in getChannels:", error);
        res.status(500).json({ message: "Error fetching channels" });
    }
};

export const joinChannel = async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id;
    // console.log("userId: ", userId);
    // console.log("channelId: ", channelId);
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.channelsJoined.includes(channelId)) {
            return res.status(400).json({ message: 'Already following this channel' });
        }

        user.channelsJoined.push(channelId);
        await user.save();

        res.status(200).json({ message: 'Channel followed successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateChannelInfo = async (req, res) => {
    try {
        const { profilePic, description, channelId } = req.body;

        if(!profilePic){
            return res.status(400).json({ message: "Profile picture is required" });
        }else if(!description){
            return res.status(400).json({ message: "Description is required" });
        }

        const channel = await Channel.findById(channelId);
        
        if (!channel) {
            return res.status(404).json({ message: "Channel not found" });
        }

        // Update channel with new profile pic URL
        channel.profilePic = profilePic;
        channel.description = description;
        await channel.save();

        res.status(200).json(channel);
    } catch (error) {
        console.log("Error in updateChannelInfo: ", error);
        res.status(500).json({ message: "Error updating channel info" });
    }
};

export const leaveChannel = async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.channelsJoined.includes(channelId)) {
            return res.status(400).json({ message: 'Already left this channel' });
        }

        user.channelsJoined = user.channelsJoined.filter(id => id.toString() !== channelId);
        await user.save();

        res.status(200).json({ message: 'Channel left successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};