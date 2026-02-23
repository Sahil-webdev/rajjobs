const mongoose = require('mongoose');

const examDetailSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  category: {
    type: String,
    required: true,
    enum: ['SSC', 'UPSC', 'Railway', 'Banking', 'Teacher', 'Defence']
  },
  metaDescription: {
    type: String,
    required: true
  },
  posterImage: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },

  // SEO Fields
  seoData: {
    // Focus Keyword - Main keyword for the page
    focusKeyword: {
      type: String,
      default: '',
      maxlength: 100
    },
    
    // LSI Keywords - Related keywords
    lsiKeywords: {
      type: [String],
      default: []
    },
    
    // Meta Title (overrides default title for SEO) — also used as H1 on page
    metaTitle: {
      type: String,
      default: '',
      maxlength: 60
    },

    // SEO Meta Description (separate from page description, max 160 chars)
    seoDescription: {
      type: String,
      default: '',
      maxlength: 160
    },
    
    // Meta Keywords
    metaKeywords: {
      type: [String],
      default: []
    },
    
    // Image Alt Texts
    imageAltTexts: {
      posterImage: {
        type: String,
        default: ''
      },
      additionalImages: [{
        url: String,
        altText: String
      }]
    },
    
    // Canonical URL
    canonicalUrl: {
      type: String,
      default: ''
    },
    
    // Schema Markup (JSON-LD string)
    schemaMarkup: {
      type: String,
      default: ''
    },
    
    // SEO Analytics
    seoScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    
    keywordDensity: {
      focusKeyword: {
        type: Number,
        default: 0
      },
      lsiKeywords: {
        type: Map,
        of: Number,
        default: {}
      }
    },
    
    readabilityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    
    // OpenGraph Data
    openGraph: {
      title: String,
      description: String,
      image: String,
      type: {
        type: String,
        default: 'article'
      }
    },
    
    // Twitter Card Data
    twitterCard: {
      card: {
        type: String,
        default: 'summary_large_image'
      },
      title: String,
      description: String,
      image: String
    }
  },

  // Section visibility flags
  enabledSections: {
    quickHighlights: { type: Boolean, default: true },
    importantDates: { type: Boolean, default: true },
    vacancyDetails: { type: Boolean, default: true },
    eligibility: { type: Boolean, default: true },
    ageLimit: { type: Boolean, default: true },
    requiredDocuments: { type: Boolean, default: true },
    examPattern: { type: Boolean, default: true },
    salary: { type: Boolean, default: true },
    syllabus: { type: Boolean, default: true },
    howToApply: { type: Boolean, default: true },
    selectionProcess: { type: Boolean, default: true },
    previousCutoff: { type: Boolean, default: false },
    applicationFees: { type: Boolean, default: true },
    importantLinks: { type: Boolean, default: true },
    faqs: { type: Boolean, default: true },
    tags: { type: Boolean, default: true }
  },

  // Quick Highlights
  quickHighlights: {
    type: Map,
    of: String,
    default: {}
  },

  // Important Dates
  importantDates: [{
    event: String,
    date: String
  }],

  // Vacancy Details
  vacancyDetails: {
    description: String,
    breakdown: [{
      post: String,
      vacancies: String
    }]
  },

  // Eligibility
  eligibility: [{
    description: String,
    content: String,
    listStyle: { type: String, enum: ['bullets', 'numbers'], default: 'bullets' }
  }],

  // Age Limit (Separate Section)
  ageLimit: [{
    description: String,
    content: String,
    listStyle: { type: String, enum: ['bullets', 'numbers'], default: 'bullets' }
  }],

  // Required Documents (New Section)
  requiredDocuments: [{
    description: String,
    content: String,
    listStyle: { type: String, enum: ['bullets', 'numbers'], default: 'bullets' }
  }],

  // Exam Pattern
  examPattern: [{
    tier: String,
    mode: String,
    subjects: String,
    questions: String,
    marks: String,
    duration: String,
    negativeMarking: String
  }],

  // Salary
  salary: [{
    description: String,
    content: String,
    listStyle: { type: String, enum: ['bullets', 'numbers'], default: 'bullets' }
  }],

  // Syllabus
  syllabus: {
    tier1: [{
      subject: String,
      topics: String
    }]
  },

  // How to Apply
  howToApply: [{
    description: String,
    content: String,
    listStyle: { type: String, enum: ['bullets', 'numbers'], default: 'numbers' }
  }],

  // Selection Process
  selectionProcess: [{
    description: String,
    content: String,
    listStyle: { type: String, enum: ['bullets', 'numbers'], default: 'bullets' }
  }],

  // Previous Cutoff
  previousCutoff: [{
    description: String,
    content: String,
    listStyle: { type: String, enum: ['bullets', 'numbers'], default: 'bullets' }
  }],

  // Application Fees
  applicationFees: [{
    description: String,
    content: String,
    listStyle: { type: String, enum: ['bullets', 'numbers'], default: 'bullets' },
    note: String
  }],

  // Important Links
  importantLinks: [{
    label: String,
    url: String,
    icon: String,
    type: { type: String, enum: ['url', 'pdf'], default: 'url' },
    file: String
  }],

  // FAQs
  faqs: [{
    question: String,
    answer: String
  }],

  // Tags
  tags: [String],

  // Related Posts
  relatedPosts: [{
    title: String,
    slug: String,
    category: String
  }],

  // Metadata
  postedBy: {
    type: String,
    default: 'Admin'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create slug from title before saving
examDetailSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('ExamDetail', examDetailSchema);
