const express = require('express');
const router = express.Router();
const College = require('../models/College');

// Create college
router.post('/', async (req, res) => {
    try {
        const college = await College.create(req.body);
        res.status(201).json({
            success: true,
            message: 'College created successfully',
            data: college
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Get all colleges
router.get('/', async (req, res) => {
    try {
        const colleges = await College.getAll();
        res.json({
            success: true,
            data: colleges
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get college by ID
router.get('/:college_id', async (req, res) => {
    try {
        const college = await College.getById(req.params.college_id);
        if (!college) {
            return res.status(404).json({
                success: false,
                message: 'College not found'
            });
        }

        const stats = await College.getStats(req.params.college_id);
        
        res.json({
            success: true,
            data: {
                ...college,
                stats: stats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update college
router.put('/:college_id', async (req, res) => {
    try {
        await College.update(req.params.college_id, req.body);
        const updatedCollege = await College.getById(req.params.college_id);
        
        res.json({
            success: true,
            message: 'College updated successfully',
            data: updatedCollege
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
