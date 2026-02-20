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
    
    // Meta Title (overrides default title for SEO)
    metaTitle: {
      type: String,
      default: '',
      maxlength: 60
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
  eligibility: {
    qualification: String,
    ageLimit: {
      minimum: String,
      maximum: String,
      relaxation: String
    },
    nationality: String,
    experience: String
  },

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
  salary: {
    payScale: String,
    details: [{
      post: String,
      payLevel: String,
      salary: String
    }],
    benefits: String
  },

  // Syllabus
  syllabus: {
    tier1: [{
      subject: String,
      topics: String
    }]
  },

  // How to Apply
  howToApply: [{
    step: Number,
    instruction: String
  }],

  // Selection Process
  selectionProcess: [{
    stage: String,
    description: String,
    status: String
  }],

  // Previous Cutoff
  previousCutoff: [{
    category: String,
    tier1: String,
    tier2: String,
    tier3: String
  }],

  // Application Fees
  applicationFees: {
    general: String,
    female: String,
    sc_st: String,
    ph: String,
    exServicemen: String,
    paymentMode: String,
    note: String
  },

  // Important Links
  importantLinks: [{
    label: String,
    url: String,
    icon: String,
    type: { type: String, enum: ['url', 'pdf'], default: 'url' }
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
