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
      values: ['SSC', 'UPSC', 'Railway', 'Banking', 'Defence', 'State Wise', 'Teaching', 'Police'],
      message: '{VALUE} is not a valid category'
    }
  },
  metaDescription: {
    type: String,
    default: '' // Optional field - not required
  },

  // Main Content
  formattedNote: {
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

  // Kept separate from the editor HTML so genuine vacancy pages can generate
  // accurate JobPosting structured data and a public job highlights card.
  jobDetails: {
    isJobPosting: { type: Boolean, default: false },
    organizationName: { type: String, trim: true, default: '' },
    postName: { type: String, trim: true, default: '' },
    startDate: { type: Date, default: null },
    lastDateToApply: { type: Date, default: null },
    totalPosts: { type: Number, min: 1, default: null },
    qualification: { type: String, trim: true, default: '' },
    ageLimit: { type: String, trim: true, default: '' },
    minSalary: { type: String, trim: true, default: '' },
    maxSalary: { type: String, trim: true, default: '' },
    employmentType: {
      type: String,
      enum: ['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'TEMPORARY', 'INTERN'],
      default: 'FULL_TIME'
    }
  },

  // These FAQs are rendered visibly on the public page. Keeping them as
  // structured fields lets us emit accurate FAQPage JSON-LD.
  faqs: [{
    _id: false,
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true }
  }],

  // SEO
  seoData: {
    seoDescription: { type: String, default: '' },
    metaKeywords: { type: [String], default: [] },
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
