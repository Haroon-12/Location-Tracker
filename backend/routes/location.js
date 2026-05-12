const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

// Get History
router.get('/:userId', async (req, res) => {
    try {
        // Limit to last 100 points for now
        const history = await Location.find({ userId: req.params.userId })
            .sort({ timestamp: -1 })
            .limit(100);
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
