const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const Alert = require('../models/Alert');

// --- Health Check ---
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// --- Contacts Routes ---
router.get('/contacts', async (req, res) => {
    try {
        const { userId } = req.query;
        const query = userId ? { userId } : {};
        const contacts = await Contact.find(query).sort({ createdAt: -1 });
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/contacts', async (req, res) => {
    try {
        const newContact = new Contact(req.body);
        const saved = await newContact.save();
        res.json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/contacts/:id', async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Alerts Routes ---
router.get('/alerts', async (req, res) => {
    try {
        const alerts = await Alert.find().sort({ timestamp: -1 });
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/alerts', async (req, res) => {
    try {
        const newAlert = new Alert(req.body);
        const saved = await newAlert.save();
        res.json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/alerts/:id', async (req, res) => {
    try {
        const updatedAlert = await Alert.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.json(updatedAlert);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
