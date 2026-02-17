"use client";

import { useState, useEffect } from "react";

interface SEOData {
  focusKeyword: string;
  lsiKeywords: string[];
  metaTitle: string;
  metaKeywords: string[];
  imageAltTexts: {
    posterImage: string;
  };
  seoScore: number;
  keywordDensity?: {
    focusKeyword: number;
  };
  readabilityScore: number;
}

interface SEOEditorProps {
  seoData: SEOData;
  examTitle: string;
  metaDescription: string;
  onChange: (seoData: SEOData) => void;
  onAnalyze?: () => void;
}

export default function SEOEditor({ seoData, examTitle, metaDescription, onChange, onAnalyze }: SEOEditorProps) {
  const [lsiKeywordInput, setLsiKeywordInput] = useState("");
  const [metaKeywordInput, setMetaKeywordInput] = useState("");

  const metaTitle = seoData.metaTitle || examTitle;
  const metaTitleLength = metaTitle.length;
  const metaDescLength = metaDescription.length;

  const getTitleColor = () => {
    if (metaTitleLength < 30) return "text-red-600";
    if (metaTitleLength > 60) return "text-orange-600";
    return "text-green-600";
  };

  const getDescColor = () => {
    if (metaDescLength < 120) return "text-red-600";
    if (metaDescLength > 160) return "text-orange-600";
    return "text-green-600";
  };

  const getSEOScoreColor = () => {
    if (seoData.seoScore >= 80) return "bg-green-500";
    if (seoData.seoScore >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const addLSIKeyword = () => {
    if (lsiKeywordInput.trim()) {
      const newKeywords = [...(seoData.lsiKeywords || []), lsiKeywordInput.trim()];
      onChange({ ...seoData, lsiKeywords: newKeywords });
      setLsiKeywordInput("");
    }
  };

  const removeLSIKeyword = (index: number) => {
    const newKeywords = seoData.lsiKeywords.filter((_, i) => i !== index);
    onChange({ ...seoData, lsiKeywords: newKeywords });
  };

  const addMetaKeyword = () => {
    if (metaKeywordInput.trim()) {
      const newKeywords = [...(seoData.metaKeywords || []), metaKeywordInput.trim()];
      onChange({ ...seoData, metaKeywords: newKeywords });
      setMetaKeywordInput("");
    }
  };

  const removeMetaKeyword = (index: number) => {
    const newKeywords = seoData.metaKeywords.filter((_, i) => i !== index);
    onChange({ ...seoData, metaKeywords: newKeywords });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            🎯 SEO Optimization
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Optimize your content for search engines
          </p>
        </div>
        
        {/* SEO Score */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-gray-600">SEO Score</div>
            <div className="text-2xl font-bold">{seoData.seoScore || 0}/100</div>
          </div>
          <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center" 
               style={{ borderColor: getSEOScoreColor().replace('bg-', '') }}>
            <div className={`w-12 h-12 rounded-full ${getSEOScoreColor()} flex items-center justify-center text-white font-bold`}>
              {seoData.seoScore || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Focus Keyword */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          🎯 Focus Keyword <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={seoData.focusKeyword || ""}
          onChange={(e) => onChange({ ...seoData, focusKeyword: e.target.value })}
          placeholder="e.g., SSC CGL 2025"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Main keyword you want to rank for in search engines
        </p>
        {seoData.keywordDensity?.focusKeyword !== undefined && (
          <div className="mt-2 text-sm">
            <span className="text-gray-600">Keyword Density: </span>
            <span className={`font-semibold ${
              seoData.keywordDensity.focusKeyword >= 1 && seoData.keywordDensity.focusKeyword <= 3 
                ? 'text-green-600' 
                : 'text-orange-600'
            }`}>
              {seoData.keywordDensity.focusKeyword}%
            </span>
            <span className="text-gray-500 ml-2">
              {seoData.keywordDensity.focusKeyword >= 1 && seoData.keywordDensity.focusKeyword <= 3
                ? '✅ Optimal'
                : seoData.keywordDensity.focusKeyword > 3
                ? '⚠️ Too high (keyword stuffing)'
                : '⚠️ Too low'}
            </span>
          </div>
        )}
      </div>

      {/* LSI Keywords */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          🔍 LSI Keywords (Related Keywords)
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={lsiKeywordInput}
            onChange={(e) => setLsiKeywordInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLSIKeyword())}
            placeholder="e.g., SSC notification, exam date"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addLSIKeyword}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {seoData.lsiKeywords?.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
            >
              {keyword}
              <button
                type="button"
                onClick={() => removeLSIKeyword(index)}
                className="text-blue-700 hover:text-blue-900"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Add 3-5 related keywords that support your focus keyword
        </p>
      </div>

      {/* Meta Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          📝 Meta Title (SEO Title)
        </label>
        <input
          type="text"
          value={seoData.metaTitle || ""}
          onChange={(e) => onChange({ ...seoData, metaTitle: e.target.value })}
          placeholder="Leave empty to use exam title"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">
            Custom title for search engines (50-60 chars recommended)
          </p>
          <span className={`text-sm font-semibold ${getTitleColor()}`}>
            {metaTitleLength}/60 chars
          </span>
        </div>
        {metaTitleLength < 30 && (
          <p className="text-xs text-red-600 mt-1">⚠️ Too short - Add more details</p>
        )}
        {metaTitleLength > 60 && (
          <p className="text-xs text-orange-600 mt-1">⚠️ Too long - Will be truncated in search results</p>
        )}
      </div>

      {/* Meta Description Preview */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          📄 Meta Description Preview
        </label>
        <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
          <div className="text-xs text-gray-500 mb-1">rajjobs.com › exams › {examTitle.toLowerCase().replace(/\s+/g, '-')}</div>
          <div className="text-blue-600 font-medium mb-1">{metaTitle || examTitle}</div>
          <div className="text-sm text-gray-700">{metaDescription}</div>
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">
            This is how it will appear in Google search results
          </p>
          <span className={`text-sm font-semibold ${getDescColor()}`}>
            {metaDescLength}/160 chars
          </span>
        </div>
      </div>

      {/* Meta Keywords */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          🏷️ Meta Keywords
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={metaKeywordInput}
            onChange={(e) => setMetaKeywordInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMetaKeyword())}
            placeholder="Add keywords"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addMetaKeyword}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {seoData.metaKeywords?.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {keyword}
              <button
                type="button"
                onClick={() => removeMetaKeyword(index)}
                className="text-gray-700 hover:text-gray-900"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Image Alt Text */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          🖼️ Poster Image Alt Text
        </label>
        <input
          type="text"
          value={seoData.imageAltTexts?.posterImage || ""}
          onChange={(e) => onChange({ 
            ...seoData, 
            imageAltTexts: { 
              ...seoData.imageAltTexts, 
              posterImage: e.target.value 
            } 
          })}
          placeholder="e.g., SSC CGL 2025 notification poster with exam dates"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Describe the image for accessibility and SEO (include focus keyword if relevant)
        </p>
      </div>

      {/* Readability Score */}
      {seoData.readabilityScore !== undefined && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900">📖 Readability Score</div>
              <div className="text-sm text-gray-600 mt-1">
                {seoData.readabilityScore >= 60 
                  ? '✅ Easy to read' 
                  : seoData.readabilityScore >= 30 
                  ? '⚠️ Moderate' 
                  : '❌ Difficult to read'}
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {seoData.readabilityScore}/100
            </div>
          </div>
        </div>
      )}

      {/* Analyze Button */}
      {onAnalyze && (
        <button
          type="button"
          onClick={onAnalyze}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
        >
          🔍 Analyze SEO Score
        </button>
      )}

      {/* SEO Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="font-semibold text-gray-900 mb-2">💡 SEO Tips:</div>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>✓ Use focus keyword in title, description, and first paragraph</li>
          <li>✓ Keep meta title between 50-60 characters</li>
          <li>✓ Keep meta description between 120-160 characters</li>
          <li>✓ Add 3-5 LSI keywords naturally in content</li>
          <li>✓ Use descriptive alt text for images</li>
          <li>✓ Avoid keyword stuffing (keep density 1-3%)</li>
        </ul>
      </div>
    </div>
  );
}
