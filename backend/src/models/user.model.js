import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        uniqueId: {
            type: String,
            required: true,
            unique: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        profilePic: {
            type: String,
            default: ''
        },
        privateChats: [
            {
                id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Store ObjectId of users
                uniqueId: { type: String }  // Store their unique username
            }
        ],
        groupsJoined: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Group'
            }
        ],
        channelsJoined: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Channel'
            }
        ],
        isSingleUser: {
            type: Boolean,
            default: true,
            immutable: true
        },
        storyVisibleTo: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
    },
    {
        timestamps: true,
    }
)

const User = mongoose.model('User', userSchema)
export default User