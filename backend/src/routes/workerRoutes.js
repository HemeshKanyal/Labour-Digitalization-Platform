const express = require('express');
const router = express.Router();
const {
    getWorkers,
    getWorkerById,
    updateWorkerProfile,
} = require('../controllers/workerController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getWorkers);
router.get('/:id', getWorkerById);
router.post('/', protect, updateWorkerProfile);

module.exports = router;
