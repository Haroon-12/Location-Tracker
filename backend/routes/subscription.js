const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Group = require('../models/Group');

// Create Payment Intent
router.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency, metadata } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            metadata: metadata || {},
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Confirm Subscription (Simulated Webhook)
router.post('/confirm', async (req, res) => {
    try {
        const { userId, plan, groupId } = req.body;

        if (groupId) {
            // Group Subscription
            const group = await Group.findById(groupId);
            if (!group) return res.status(404).json({ msg: 'Group not found' });

            group.plan = plan;

            // Set limits based on plan
            if (plan.includes('duo')) {
                group.memberLimit = 2;
            } else if (plan.includes('family')) {
                group.memberLimit = 5;
            } else {
                group.memberLimit = 5; // Default fallback
            }

            group.planExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year default for demo
            await group.save();
        } else {
            // Individual Subscription
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ msg: 'User not found' });

            user.subscription = plan;
            await user.save();
        }

        res.json({ msg: 'Subscription updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
