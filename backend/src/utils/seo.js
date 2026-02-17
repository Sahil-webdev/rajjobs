/**
 * SEO Utility Functions
 * Helper functions for SEO calculations, validation, and optimization
 */

/**
 * Calculate keyword density in text
 * @param {string} text - Content to analyze
 * @param {string} keyword - Keyword to find
 * @returns {number} - Percentage density
 */
const calculateKeywordDensity = (text, keyword) => {
  if (!text || !keyword) return 0;
  
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;
  
  if (totalWords === 0) return 0;
  
  const keywordLower = keyword.toLowerCase();
  const keywordWords = keywordLower.split(/\s+/);
  const keywordLength = keywordWords.length;
  
  let count = 0;
  
  // Single word keyword
  if (keywordLength === 1) {
    count = words.filter(w => w === keywordLower).length;
  } else {
    // Multi-word keyword (phrase)
    for (let i = 0; i <= totalWords - keywordLength; i++) {
      const phrase = words.slice(i, i + keywordLength).join(' ');
      if (phrase === keywordLower) {
        count++;
      }
    }
  }
  
  return ((count / totalWords) * 100).toFixed(2);
};

/**
 * Calculate readability score (Flesch Reading Ease)
 * @param {string} text - Content to analyze
 * @returns {number} - Score from 0-100
 */
const calculateReadability = (text) => {
  if (!text) return 0;
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  
  const sentenceCount = sentences.length;
  const wordCount = words.length;
  
  if (sentenceCount === 0 || wordCount === 0) return 0;
  
  const avgSentenceLength = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllables / wordCount;
  
  // Flesch Reading Ease formula
  const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

/**
 * Count syllables in a word (approximation)
 * @param {string} word - Word to analyze
 * @returns {number} - Number of syllables
 */
const countSyllables = (word) => {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  
  const syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
};

/**
 * Calculate overall SEO score
 * @param {object} data - Exam data with SEO fields
 * @returns {number} - Score from 0-100
 */
const calculateSEOScore = (data) => {
  let score = 0;
  let checks = 0;
  
  // 1. Focus Keyword (10 points)
  if (data.seoData?.focusKeyword && data.seoData.focusKeyword.length > 0) {
    score += 10;
  }
  checks++;
  
  // 2. Meta Title (10 points)
  const metaTitle = data.seoData?.metaTitle || data.title;
  if (metaTitle && metaTitle.length >= 30 && metaTitle.length <= 60) {
    score += 10;
  } else if (metaTitle && metaTitle.length > 0) {
    score += 5;
  }
  checks++;
  
  // 3. Meta Description (10 points)
  if (data.metaDescription && data.metaDescription.length >= 120 && data.metaDescription.length <= 160) {
    score += 10;
  } else if (data.metaDescription && data.metaDescription.length > 0) {
    score += 5;
  }
  checks++;
  
  // 4. Image Alt Text (10 points)
  if (data.seoData?.imageAltTexts?.posterImage && data.seoData.imageAltTexts.posterImage.length > 0) {
    score += 10;
  }
  checks++;
  
  // 5. Focus Keyword in Title (15 points)
  if (data.seoData?.focusKeyword && metaTitle) {
    if (metaTitle.toLowerCase().includes(data.seoData.focusKeyword.toLowerCase())) {
      score += 15;
    }
  }
  checks++;
  
  // 6. Focus Keyword in Meta Description (10 points)
  if (data.seoData?.focusKeyword && data.metaDescription) {
    if (data.metaDescription.toLowerCase().includes(data.seoData.focusKeyword.toLowerCase())) {
      score += 10;
    }
  }
  checks++;
  
  // 7. LSI Keywords (10 points)
  if (data.seoData?.lsiKeywords && data.seoData.lsiKeywords.length >= 3) {
    score += 10;
  } else if (data.seoData?.lsiKeywords && data.seoData.lsiKeywords.length > 0) {
    score += 5;
  }
  checks++;
  
  // 8. Slug is SEO-friendly (10 points)
  if (data.slug && /^[a-z0-9-]+$/.test(data.slug) && data.slug.length > 0) {
    score += 10;
  }
  checks++;
  
  // 9. Content length (15 points)
  let contentLength = 0;
  if (data.eligibility?.qualification) contentLength += data.eligibility.qualification.length;
  if (data.howToApply) contentLength += JSON.stringify(data.howToApply).length;
  
  if (contentLength > 1000) {
    score += 15;
  } else if (contentLength > 500) {
    score += 10;
  } else if (contentLength > 0) {
    score += 5;
  }
  checks++;
  
  return Math.round(score);
};

/**
 * Extract LSI keywords suggestions from content
 * @param {string} text - Content to analyze
 * @param {string} focusKeyword - Main keyword
 * @returns {array} - Array of suggested LSI keywords
 */
const suggestLSIKeywords = (text, focusKeyword) => {
  if (!text || !focusKeyword) return [];
  
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'];
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !commonWords.includes(w));
  
  // Count word frequency
  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  // Sort by frequency and get top related words
  const sorted = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word)
    .filter(word => !focusKeyword.toLowerCase().includes(word));
  
  return sorted;
};

/**
 * Validate meta title length
 * @param {string} title - Meta title to validate
 * @returns {object} - Validation result
 */
const validateMetaTitle = (title) => {
  if (!title) {
    return { valid: false, message: 'Meta title is required', suggestion: 'Add a compelling title (50-60 characters)' };
  }
  
  const length = title.length;
  
  if (length < 30) {
    return { valid: false, message: 'Title too short', suggestion: 'Aim for 50-60 characters for better visibility' };
  }
  
  if (length > 60) {
    return { valid: false, message: 'Title too long (will be truncated)', suggestion: 'Keep it under 60 characters' };
  }
  
  return { valid: true, message: 'Good length!', length };
};

/**
 * Validate meta description length
 * @param {string} description - Meta description to validate
 * @returns {object} - Validation result
 */
const validateMetaDescription = (description) => {
  if (!description) {
    return { valid: false, message: 'Meta description is required', suggestion: 'Add a description (120-160 characters)' };
  }
  
  const length = description.length;
  
  if (length < 120) {
    return { valid: false, message: 'Description too short', suggestion: 'Aim for 120-160 characters' };
  }
  
  if (length > 160) {
    return { valid: false, message: 'Description too long (will be truncated)', suggestion: 'Keep it under 160 characters' };
  }
  
  return { valid: true, message: 'Perfect length!', length };
};

/**
 * Generate Schema.org markup for exam
 * @param {object} examData - Exam data
 * @returns {string} - JSON-LD string
 */
const generateExamSchema = (examData) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": examData.title,
    "description": examData.metaDescription,
    "startDate": examData.importantDates?.[0]?.date || new Date().toISOString(),
    "location": {
      "@type": "VirtualLocation",
      "url": `https://rajjobs.com/exams/${examData.slug}`
    },
    "image": examData.posterImage || "",
    "organizer": {
      "@type": "Organization",
      "name": examData.quickHighlights?.get?.('organization') || examData.category,
      "url": examData.quickHighlights?.get?.('website') || "https://rajjobs.com"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "url": `https://rajjobs.com/exams/${examData.slug}`
    }
  };
  
  return JSON.stringify(schema);
};

module.exports = {
  calculateKeywordDensity,
  calculateReadability,
  calculateSEOScore,
  suggestLSIKeywords,
  validateMetaTitle,
  validateMetaDescription,
  generateExamSchema,
  countSyllables
};
