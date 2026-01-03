const mongoose = require('mongoose');

const workerProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    skills: [{
        type: String,
    }],
    hourlyRate: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
    },
    rating: {
        type: Number,
        default: 0,
    },
    totalJobs: {
        type: Number,
        default: 0,
    },
    totalEarnings: {
        type: Number,
        default: 0,
    },
    availability: {
        type: Boolean,
        default: true,
    },
});

module.exports = mongoose.model('WorkerProfile', workerProfileSchema);
