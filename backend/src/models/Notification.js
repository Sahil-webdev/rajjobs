const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['announcement', 'email', 'push'], default: 'announcement' },
    audience: { type: String, enum: ['all', 'students', 'instructors'], default: 'all' },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
