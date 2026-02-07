const express = require('express');
const router = express.Router();
const Notification = require('../../models/Notification');

// Get latest active notifications (for homepage)
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const notifications = await Notification.find({ isActive: true })
      .sort({ date: -1 })
      .limit(limit)
      .select('title category link date');
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

module.exports = router;
