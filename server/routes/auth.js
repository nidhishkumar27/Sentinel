const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const Officer = require('../models/Officer');

const JWT_SECRET = process.env.JWT_SECRET || 'sentinel-secret-key-change-in-prod';

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const {
            username, password, name, role,
            agencyType, officialEmail, officialPhone, jurisdiction,
            officerName, designation, officerId, geoRadius
        } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (role === 'AUTHORITY' || role === 'AGENCY') {
            // REGISTER OFFICER
            const existingOfficer = await Officer.findOne({ username });
            if (existingOfficer) return res.status(400).json({ error: 'Officer username exists' });

            const newOfficer = new Officer({
                username,
                password: hashedPassword,
                agencyName: name, // Map 'name' to agencyName
                agencyType,
                officialEmail,
                officialPhone,
                jurisdiction,
                officerName,
                designation,
                officerId,
                geoRadius: geoRadius ? parseInt(geoRadius) : 5,
                role: 'AUTHORITY'
            });
            const savedOfficer = await newOfficer.save();
            return res.status(201).json({
                message: 'Officer registered',
                user: { id: savedOfficer._id, username: savedOfficer.username, role: savedOfficer.role }
            });

        } else {
            // REGISTER TOURIST
            const existingUser = await User.findOne({ username });
            if (existingUser) return res.status(400).json({ error: 'Username exists' });

            const newUser = new User({
                username,
                password: hashedPassword,
                name,
                role: 'TOURIST'
            });
            const savedUser = await newUser.save();
            return res.status(201).json({
                message: 'Tourist registered',
                user: { id: savedUser._id, username: savedUser.username, role: savedUser.role }
            });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        // Frontend must now send 'role' to know which DB to check
        const { username, password, role } = req.body;

        let user = null;
        let isAuthority = (role === 'AUTHORITY' || role === 'AGENCY');

        if (isAuthority) {
            user = await Officer.findOne({ username });
        } else {
            user = await User.findOne({ username });
        }

        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials (User not found)' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Create Token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: isAuthority ? user.agencyName : user.name, // different fields
                username: user.username,
                role: user.role,
                photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
                // Add extra fields for authority if needed
                jurisdiction: user.jurisdiction,
                officerName: user.officerName
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
