import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  media: [{
    text: { type: String },
    url: { type: String, required: true },  // File URL (image/video)
    type: { type: String }  // Media type
  }],  // List of images/videos
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '24h', // Automatically delete the story after 24 hours
  },
  seenBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  // groupId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: true,
  // },
}, {
  timestamps: true,
});

const Story = mongoose.model('Story', storySchema);

export default Story;