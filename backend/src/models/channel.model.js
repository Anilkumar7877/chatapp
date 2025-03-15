import mongoose from 'mongoose'

const ChannelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        description: {
            type: String
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        profilePic: {
            type: String,
            default: ''
        },
        isChannel: {
            type: Boolean,
            default: true,
            immutable: true
        }
    }, { timestamps: true }
);


const Channel = mongoose.model("Channel", ChannelSchema);
export default Channel;