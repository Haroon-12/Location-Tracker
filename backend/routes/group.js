const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// Create Group
router.post('/create', async (req, res) => {
    try {
        const { name, userId } = req.body;
        const inviteCode = uuidv4().substring(0, 6).toUpperCase();

        const group = new Group({
            name,
            admin: userId,
            members: [userId],
            inviteCode
        });

        await group.save();

        // Add group to user's list
        await User.findByIdAndUpdate(userId, { $push: { groups: group._id } });

        res.json(group);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Join Group
router.post('/join', async (req, res) => {
    try {
        const { inviteCode, userId } = req.body;
        const group = await Group.findOne({ inviteCode });

        if (!group) return res.status(404).json({ msg: 'Group not found' });
        if (group.members.includes(userId)) return res.status(400).json({ msg: 'Already a member' });

        if (group.members.length >= group.memberLimit) {
            return res.status(400).json({ msg: 'Circle is full! Upgrade plan to add more members.' });
        }

        group.members.push(userId);
        await group.save();

        await User.findByIdAndUpdate(userId, { $push: { groups: group._id } });

        res.json(group);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get User Groups
router.get('/user/:userId', async (req, res) => {
    try {
        const groups = await Group.find({ members: req.params.userId })
            .populate('members', 'name email')
            .populate('admin', 'name');
        res.json(groups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Group
router.delete('/:groupId', async (req, res) => {
    try {
        const { userId } = req.body;
        const group = await Group.findById(req.params.groupId);

        if (!group) return res.status(404).json({ msg: 'Group not found' });

        if (group.admin.toString() !== userId) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Group.findByIdAndDelete(req.params.groupId);

        // Remove group from all members' lists
        await User.updateMany(
            { groups: req.params.groupId },
            { $pull: { groups: req.params.groupId } }
        );

        res.json({ msg: 'Group removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
