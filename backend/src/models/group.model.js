import mongoose from 'mongoose'

const GroupSchema = new mongoose.Schema({
    name: String,
    admin: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
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
    isGroup: {
        type: Boolean,
        default: true,
        immutable: true
    }
});

const Group = mongoose.model("Group", GroupSchema);
export default Group;