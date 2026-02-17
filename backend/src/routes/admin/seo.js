const express = require('express');
const router = express.Router();
const ExamDetail = require('../../models/ExamDetail');
const {
  calculateKeywordDensity,
  calculateReadability,
  calculateSEOScore,
  suggestLSIKeywords,
  validateMetaTitle,
  validateMetaDescription,
  generateExamSchema
} = require('../../utils/seo');

/**
 * @route   POST /api/admin/seo/analyze
 * @desc    Analyze SEO for exam content
 * @access  Private (Admin)
 */
router.post('/analyze', async (req, res) => {
  try {
    const { examId, content, focusKeyword, metaTitle, metaDescription } = req.body;
    
    // Combine all content for analysis
    const fullContent = [
      content.title || '',
      content.metaDescription || '',
      content.eligibility?.qualification || '',
      JSON.stringify(content.howToApply || []),
      JSON.stringify(content.syllabus || {}),
      JSON.stringify(content.faqs || [])
    ].join(' ');
    
    // Calculate metrics
    const keywordDensity = calculateKeywordDensity(fullContent, focusKeyword);
    const readabilityScore = calculateReadability(fullContent);
    const lsiSuggestions = suggestLSIKeywords(fullContent, focusKeyword);
    
    // Validate meta tags
    const titleValidation = validateMetaTitle(metaTitle || content.title);
    const descriptionValidation = validateMetaDescription(metaDescription || content.metaDescription);
    
    // Calculate overall SEO score
    const seoScore = calculateSEOScore({
      ...content,
      seoData: {
        focusKeyword,
        metaTitle,
        ...content.seoData
      }
    });
    
    res.json({
      success: true,
      analysis: {
        seoScore,
        keywordDensity: {
          value: keywordDensity,
          status: keywordDensity >= 1 && keywordDensity <= 3 ? 'good' : keywordDensity > 3 ? 'high' : 'low',
          message: keywordDensity >= 1 && keywordDensity <= 3 
            ? 'Keyword density is optimal' 
            : keywordDensity > 3 
            ? 'Warning: Keyword stuffing detected' 
            : 'Increase focus keyword usage'
        },
        readability: {
          score: readabilityScore,
          level: readabilityScore >= 60 ? 'Easy to read' : readabilityScore >= 30 ? 'Moderate' : 'Difficult'
        },
        metaTitle: titleValidation,
        metaDescription: descriptionValidation,
        lsiSuggestions,
        recommendations: generateRecommendations(seoScore, keywordDensity, readabilityScore, titleValidation, descriptionValidation)
      }
    });
  } catch (error) {
    console.error('SEO analysis error:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze SEO', error: error.message });
  }
});

/**
 * @route   PUT /api/admin/seo/update/:id
 * @desc    Update SEO data for an exam
 * @access  Private (Admin)
 */
router.put('/update/:id', async (req, res) => {
  try {
    const { seoData } = req.body;
    
    const exam = await ExamDetail.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }
    
    // Generate schema markup if not provided
    if (!seoData.schemaMarkup) {
      seoData.schemaMarkup = generateExamSchema({
        ...exam.toObject(),
        seoData
      });
    }
    
    // Calculate and update SEO score
    const fullContent = [
      exam.title,
      exam.metaDescription,
      exam.eligibility?.qualification || '',
      JSON.stringify(exam.howToApply || [])
    ].join(' ');
    
    seoData.seoScore = calculateSEOScore({
      ...exam.toObject(),
      seoData
    });
    
    if (seoData.focusKeyword) {
      seoData.keywordDensity = {
        focusKeyword: calculateKeywordDensity(fullContent, seoData.focusKeyword)
      };
    }
    
    seoData.readabilityScore = calculateReadability(fullContent);
    
    exam.seoData = { ...exam.seoData, ...seoData };
    await exam.save();
    
    res.json({
      success: true,
      message: 'SEO data updated successfully',
      seoData: exam.seoData
    });
  } catch (error) {
    console.error('SEO update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update SEO data', error: error.message });
  }
});

/**
 * @route   GET /api/admin/seo/preview/:id
 * @desc    Get SEO preview for an exam
 * @access  Private (Admin)
 */
router.get('/preview/:id', async (req, res) => {
  try {
    const exam = await ExamDetail.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }
    
    const metaTitle = exam.seoData?.metaTitle || exam.title;
    const metaDescription = exam.metaDescription;
    
    res.json({
      success: true,
      preview: {
        title: metaTitle,
        description: metaDescription,
        url: `https://rajjobs.com/exams/${exam.slug}`,
        image: exam.posterImage,
        focusKeyword: exam.seoData?.focusKeyword || '',
        seoScore: exam.seoData?.seoScore || 0
      }
    });
  } catch (error) {
    console.error('SEO preview error:', error);
    res.status(500).json({ success: false, message: 'Failed to get SEO preview', error: error.message });
  }
});

/**
 * Generate SEO recommendations based on analysis
 */
function generateRecommendations(seoScore, keywordDensity, readability, titleValidation, descriptionValidation) {
  const recommendations = [];
  
  if (seoScore < 70) {
    recommendations.push({
      type: 'warning',
      message: 'SEO score is below 70. Follow the recommendations below to improve.'
    });
  }
  
  if (!titleValidation.valid) {
    recommendations.push({
      type: 'error',
      field: 'metaTitle',
      message: titleValidation.message,
      suggestion: titleValidation.suggestion
    });
  }
  
  if (!descriptionValidation.valid) {
    recommendations.push({
      type: 'error',
      field: 'metaDescription',
      message: descriptionValidation.message,
      suggestion: descriptionValidation.suggestion
    });
  }
  
  if (keywordDensity < 1) {
    recommendations.push({
      type: 'warning',
      field: 'keyword',
      message: 'Focus keyword appears less frequently',
      suggestion: 'Include your focus keyword naturally in the content (aim for 1-3% density)'
    });
  }
  
  if (keywordDensity > 3) {
    recommendations.push({
      type: 'error',
      field: 'keyword',
      message: 'Keyword stuffing detected',
      suggestion: 'Reduce focus keyword usage to avoid Google penalty (keep under 3%)'
    });
  }
  
  if (readability < 30) {
    recommendations.push({
      type: 'warning',
      field: 'readability',
      message: 'Content is difficult to read',
      suggestion: 'Use shorter sentences and simpler words'
    });
  }
  
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'success',
      message: '✅ Great! Your content is well optimized for SEO.'
    });
  }
  
  return recommendations;
}

module.exports = router;
