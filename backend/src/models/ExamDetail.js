const mongoose = require('mongoose');

// ✅ SIMPLE, CLEAN SCHEMA - Only what admin form actually needs
const examDetailSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['SSC', 'UPSC', 'Railway', 'Banking', 'Defence', 'State Govt', 'Teaching', 'Police'],
      message: '{VALUE} is not a valid category'
    }
  },
  metaDescription: {
    type: String,
    required: [true, 'Meta description is required'],
    maxlength: [300, 'Meta description cannot exceed 300 characters']
  },
  
  // Main Content
  formattedNote: {
    type: String,
    default: ''
  },
  
  // Media
  posterImage: {
    type: String,
    default: ''
  },
  
  // Publishing
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  },
  postedBy: {
    type: String,
    default: 'Admin'
  },
  
  // SEO
  seoData: {
    focusKeyword: { type: String, default: '' },
    lsiKeywords: { type: [String], default: [] },
    metaTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    metaKeywords: { type: [String], default: [] },
    imageAltTexts: {
      posterImage: { type: String, default: '' }
    },
    seoScore: { type: Number, default: 0, min: 0, max: 100 },
    readabilityScore: { type: Number, default: 0, min: 0, max: 100 }
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt automatically
});

// Auto-generate slug from title if not provided
examDetailSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

module.exports = mongoose.model('ExamDetail', examDetailSchema);
