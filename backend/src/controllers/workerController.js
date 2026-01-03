const WorkerProfile = require('../models/WorkerProfile');
const User = require('../models/User');

// @desc    Get all workers
// @route   GET /api/workers
// @access  Public
const getWorkers = async (req, res) => {
    try {
        const workers = await WorkerProfile.find({}).populate('user', 'name email');
        res.status(200).json(workers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get worker by ID
// @route   GET /api/workers/:id
// @access  Public
const getWorkerById = async (req, res) => {
    try {
        const worker = await WorkerProfile.findById(req.params.id).populate('user', 'name email');
        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }
        res.status(200).json(worker);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create or update worker profile
// @route   POST /api/workers
// @access  Private (Worker only)
const updateWorkerProfile = async (req, res) => {
    const { skills, hourlyRate, location, bio, availability } = req.body;

    const profileFields = {
        user: req.user._id,
        skills: skills ? skills.split(',').map((skill) => skill.trim()) : undefined,
        hourlyRate,
        location,
        bio,
        availability,
    };

    try {
        let profile = await WorkerProfile.findOne({ user: req.user._id });

        if (profile) {
            // Update
            profile = await WorkerProfile.findOneAndUpdate(
                { user: req.user._id },
                { $set: profileFields },
                { new: true }
            );
            return res.json(profile);
        }

        // Create
        profile = new WorkerProfile(profileFields);
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getWorkers,
    getWorkerById,
    updateWorkerProfile,
};
