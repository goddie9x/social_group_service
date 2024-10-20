const mongoose = require('../configs/mongo');

const GroupMemberSchema = new mongoose.Schema({
    group: {
        type: mongoose.Schema.ObjectId,
        require: true,
        ref: 'Groups',
    },
    user: {
        type: mongoose.Schema.ObjectId,
        required: true,
    },
    accepted: {
        type: Boolean,
        default: false,
    },
    banned: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

GroupMemberSchema.index({
    group: 1,
    user: 1,
}, { unique: true });
GroupMemberSchema.index({
    user: 1,
    group: 1,
    createdAt: -1
});
GroupMemberSchema.index({
    group: 1,
    accepted: 1,
    createdAt: -1
});
module.exports = mongoose.model('GroupMembers', GroupMemberSchema);