const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    category: { 
      type: String, 
      required: true,
      enum: ['SSC', 'UPSC', 'Railway', 'Defence', 'Teacher', 'Banking', 'Army', 'Police', 'Other']
    },
    link: { 
      type: String, 
      required: true 
    },
    date: { 
      type: Date, 
      default: Date.now 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
