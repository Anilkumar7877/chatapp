import Message from "../models/message.model.js";
import User from "../models/user.model.js"
import Group from "../models/group.model.js"
import Channel from "../models/channel.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // Fetch the user's privateChats array
        const user = await User.findById(loggedInUserId).select('privateChats');
        const privateChats = user.privateChats.map(chat => chat.id);

        // Find users that are in the user's privateChats array
        const filteredUser = await User.find({ _id: { $in: privateChats } }).select("-password");

        return res.status(200).json(filteredUser);
    } catch (error) {
        console.log("error in getUsersForSidebar", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const searchUserByUniqueId = async (req, res) => {
    try {
        const { uniqueId } = req.params;
        // console.log("uniqueId", uniqueId);
        if (!uniqueId) {
            return res.status(400).json({ message: "uniqueId parameter is required" });
        }

        // Find user by uniqueId
        const user = await User.findOne({ uniqueId: { $regex: new RegExp(`^${uniqueId}$`, 'i') } }).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.log("error in searchUserByUniqueId", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const myId = req.user._id;
        const { id: userToChatId } = req.params;

        const isGroup = await Group.findById(userToChatId);
        const isChannel = await Channel.findById(userToChatId);

        let messages;
        if (isChannel) {
            messages = await Message.find({ receiverId: userToChatId })
                .populate("senderId", "fullName profilePic")
                .sort({ createdAt: 1 })
                .exec();
        } else if (isGroup) {
            messages = await Message.find({ receiverId: userToChatId }).populate("senderId", "fullName profilePic")  // Populate sender details
                .sort({ createdAt: 1 })  // Sort by oldest first
                .exec();
        } else {
            messages = await Message.find({
                $or: [
                    { senderId: myId, receiverId: userToChatId },
                    { senderId: userToChatId, receiverId: myId }
                ]
            }).populate("senderId", "fullName profilePic")  // Populate sender details
                .sort({ createdAt: 1 })  // Sort by oldest first
                .exec();
        }

        return res.status(200).json(messages)
    } catch (error) {
        console.log("error in getMessages", error);
        res.status(500).json({ message: "Internal server error" })
    }
}

export const sendMessages = async (req, res) => {
    try {
        const { text, image, file } = req.body;

        const myId = req.user._id;
        const { id: userToChatId } = req.params;

        const isGroup = await Group.findOne({ _id: userToChatId })
        const isChannel = await Channel.findOne({ _id: userToChatId })

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url;
        }

        let newMessage;

        if (isChannel) {
            const channelMembers = isChannel.members;

            newMessage = new Message({
                senderId: myId,
                receiverId: userToChatId,
                image: imageUrl,
                text: text,
                file: file,
                isChannelMessage: true,
                read: [],
            });

            await newMessage.save();
            const populatedMessage = await newMessage.populate("senderId", "fullName profilePic");

            // console.log(channelMembers);

            // Emit to all channel members
            io.to(userToChatId.toString()).emit("newMessage", populatedMessage);
            // console.log(`Sent message to group room: ${userToChatId}`);
        }
        else if (isGroup) {
            const groupMembers = isGroup.members;

            newMessage = new Message({
                senderId: myId,
                receiverId: userToChatId,
                image: imageUrl,
                text: text,
                file: file,
                isGroupMessage: true,
                read: [],
            })

            await newMessage.save()

            const populatedMessage = await newMessage.populate("senderId", "fullName profilePic");

            io.to(userToChatId.toString()).emit("newMessage", populatedMessage);
            // console.log(`Sent message to group room: ${userToChatId}`);

        } else {
            newMessage = new Message({
                senderId: myId,
                receiverId: userToChatId,
                image: imageUrl,
                text: text,
                file: file,
                read: [],
            })

            await newMessage.save()

            const populatedMessage = await newMessage.populate("senderId", "fullName profilePic");

            const receiverSocketId = getReceiverSocketId(userToChatId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newMessage", populatedMessage);
            }
        }

        // Update privateChats for sender if not already present
        const sender = await User.findById(myId);
        if (!newMessage.isChannelMessage && !newMessage.isGroupMessage) {
            const alreadyExists = sender.privateChats.some(chat => chat.id.equals(userToChatId));
            if (!alreadyExists) {
                const receiverUser = await User.findById(userToChatId);
                sender.privateChats.push({ id: receiverUser._id, uniqueId: receiverUser.uniqueId });
                await sender.save();
            }
        }

        // Update privateChats for receiver if not already present
        const receiver = await User.findById(userToChatId);
        if (!newMessage.isChannelMessage && !newMessage.isGroupMessage) {
            const alreadyExists = receiver.privateChats.some(chat => chat.id.equals(myId));
            if (!alreadyExists) {
                const senderUser = await User.findById(myId);
                receiver.privateChats.push({ id: senderUser._id, uniqueId: senderUser.uniqueId });
                await receiver.save();
            }
        }


        return res.status(201).json(newMessage)
    } catch (error) {
        console.log("Error in sendMessages controller: ", error);
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

export const documentUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file provided"
            });
        }

        // Validate file size
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        if (req.file.size > MAX_FILE_SIZE) {
            return res.status(400).json({
                success: false,
                message: "File size exceeds 5MB limit"
            });
        }

        // Validate file type
        const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword'];
        if (!allowedMimes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: "Invalid file type"
            });
        }

        return res.status(200).json({
            success: true,
            path: req.file.path
        });

    } catch (error) {
        console.error("Error in documentUpload:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to upload file",
            error: error.message
        });
    }
}

export const markMessagesAsRead = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        // Update messages and get the updated documents
        const updatedMessages = await Message.updateMany(
            {
                $or: [
                    { receiverId: userId, senderId: chatId },
                    { receiverId: chatId, senderId: { $ne: userId } }
                ],
                read: { $ne: userId } // Only update if userId is not already in the read array
            },
            {
                $addToSet: { read: userId } // Add userId to the read array
            }
        );

        // Send back the updated messages
        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: chatId },
                { senderId: chatId, receiverId: userId },
                { receiverId: chatId }
            ]
        }).populate("senderId", "-password");

        res.status(200).json({
            messages,
            modifiedCount: updatedMessages.modifiedCount
        });

    } catch (error) {
        console.log("Error marking messages as read:", error);
        res.status(500).json({ error: "Failed to mark messages as read" });
    }
};