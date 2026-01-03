const Job = require('../models/Job');

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private
const createJob = async (req, res) => {
    const { workerId, title, description, amount, location, date } = req.body;

    if (!title || !description || !amount || !location) {
        return res.status(400).json({ message: 'Please add all required fields' });
    }

    try {
        const job = await Job.create({
            customer: req.user._id,
            worker: workerId,
            title,
            description,
            amount,
            location,
            date: date || Date.now(),
            status: workerId ? 'pending' : 'pending', // Simplify for now
        });

        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user jobs
// @route   GET /api/jobs
// @access  Private
const getMyJobs = async (req, res) => {
    try {
        // Find jobs where user is customer OR worker
        const jobs = await Job.find({
            $or: [{ customer: req.user._id }, { worker: req.user._id }],
        }).populate('customer', 'name email').populate('worker', 'name email');
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update job status
// @route   PUT /api/jobs/:id
// @access  Private
const updateJobStatus = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Ensure user is authorized to update this job
        if (
            job.customer.toString() !== req.user.id &&
            (job.worker && job.worker.toString() !== req.user.id)
        ) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        job.status = req.body.status || job.status;

        // If job is completed, we might want to update worker earnings here

        const updatedJob = await job.save();

        res.status(200).json(updatedJob);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createJob,
    getMyJobs,
    updateJobStatus,
};
