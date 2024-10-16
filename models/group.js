const mongoose = require('../configs/mongo');
const GROUPS = require('../utils/constants/groups');

const PRIVACY_ARRAY = Object.values(GROUPS.PRIVACY);

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
    },
    cover: {
        type: String,
    },
    admin: [{
        type: mongoose.Schema.ObjectId,
        required: true
    }],
    mod: [{
        type: mongoose.Schema.ObjectId,
        required: true
    }],
    description: {
        type: String
    },
    privacy: {
        type: Number,
        enum: PRIVACY_ARRAY,
        default: GROUPS.PRIVACY.PUBLIC
    },
    needApprovedToJoin: {
        type: Boolean,
        default: false,
    },
    location: {
        type: String,
    },
}, { timestamps: true });

GroupSchema.index({ admin: 1 });
GroupSchema.index({ mod: 1 });

module.exports = mongoose.model('Groups', GroupSchema);