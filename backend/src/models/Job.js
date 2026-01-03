const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // Worker might not be assigned initially if it's an open job post
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
        default: 'pending',
    },
    amount: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Job', jobSchema);
