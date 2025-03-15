import Message from "../models/message.model.js";
import cloudinary from '../lib/cloudinary.js'
import User from "../models/user.model.js"
import Group from "../models/group.model.js"
import { io } from "../lib/socket.js"

// import cloudinary from "../lib/cloudinary.js";
// import { getReceiverSocketId, io } from "../lib/socket.js";

export const getGroups = async (req, res) => {
    try {
        const myId = req.user._id;

        // Fetch the user's groupsJoined array
        const user = await User.findById(myId).select('groupsJoined');
        const groupsJoined = user.groupsJoined;

        // Find groups that are in the user's groupsJoined array
        const groups = await Group.find({ _id: { $in: groupsJoined } });

        return res.status(200).json(groups);
    } catch (error) {
        console.log("Error in getGroups:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createGroup = async (req, res) => {
    try {
        // console.log("req.body is ", req.body);
        const { groupName, selectedUsers } = req.body;
        // console.log("{ groupName, selectedUsers } ", { groupName, selectedUsers });
        const creatorId = req.user._id;

        if (!groupName || !Array.isArray(selectedUsers) || selectedUsers.length < 3) {
            return res.status(400).json({ message: "Group must have a name and at least 3 members." });
        }
        if (groupName.length < 3) {
            return res.status(400).json({ message: 'Group name must be at least 3 characters long' });
        }

        const updatedMembers = [...new Set([...selectedUsers, creatorId])];

        const group = new Group({
            name: groupName,
            members: updatedMembers,
            admin: [creatorId]
        })

        await group.save()

        // Update the groupsJoined field for each member
        await User.updateMany(
            { _id: { $in: updatedMembers } },
            { $addToSet: { groupsJoined: group._id } }
        );

        return res.status(201).json({ group })
    } catch (error) {
        console.log("error in createGroup", error);
        res.status(500).json({ message: "Internal server error" })
    }
}

export const addUserToGroup = async (req, res) => {
    try {
        const { groupId, userId } = req.body;

        // Check if group exists
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Check if user is already in the group
        if (group.members.includes(userId)) {
            return res.status(400).json({ message: "User is already in the group" });
        }

        // Add user to the group
        group.members.push(userId);
        await group.save();

        // Update the user's groupsJoined field
        await User.findByIdAndUpdate(userId, { $addToSet: { groupsJoined: groupId } });
        
        // Populate new member details
        const updatedGroup = await Group.findById(groupId).populate("members");

        // Notify all members via socket
        io.to(groupId).emit("groupUpdated", updatedGroup);

        res.status(200).json({ message: "User added successfully", group: updatedGroup });
    } catch (error) {
        console.error("Error adding user to group:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.body;
        console.log("groupId is ", groupId);
        const userId = req.user._id;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }
        // console.log("before leaving", group.members);
        group.members = group.members.filter(member => member.toString() !== userId.toString());
        await group.save();
        
        // Update the user's groupsJoined field
        await User.findByIdAndUpdate(userId, { $pull: { groupsJoined: groupId } });

        // console.log("after leaving", group.members);


        res.status(200).json({ message: "Left group successfully in group.controller" });
    } catch (error) {
        console.log("Error in leaveGroup: ", error);
        res.status(500).json({ message: "Error leaving group in group.controller" });
    }
};

export const updateGroupInfo = async (req, res) => {
    try {
        const { profilePic, groupId } = req.body;
        // const userId = req.user._id;
        // console.log(profilePic, groupId);

        if (!profilePic) return res.status(400).json({ message: "Profile pic is required." })

        const uploadResponse = await cloudinary.uploader.upload(profilePic)

        const updatedGroup = await Group.findByIdAndUpdate(
            groupId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        )

        res.status(200).json(updatedGroup)
        // console.log(updatedGroup);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

