const express = require('express');
const Setting = require('../../models/Setting');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

// GET /api/admin/settings
router.get('/', asyncHandler(async (req, res) => {
  const settings = await Setting.find();
  res.json(settings);
}));

// PUT /api/admin/settings
router.put('/', asyncHandler(async (req, res) => {
  const entries = req.body; // expect array of { key, value }
  if (!Array.isArray(entries)) return res.status(400).json({ message: 'Payload must be array' });
  const results = [];
  for (const entry of entries) {
    if (!entry.key) continue;
    const updated = await Setting.findOneAndUpdate(
      { key: entry.key },
      { value: entry.value },
      { upsert: true, new: true }
    );
    results.push(updated);
  }
  res.json(results);
}));

module.exports = router;
