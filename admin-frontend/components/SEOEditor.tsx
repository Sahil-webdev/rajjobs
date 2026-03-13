"use client";

import { useState } from "react";

interface SEOData {
  focusKeyword: string;
  seoDescription: string;
  metaKeywords: string[];
}

interface SEOEditorProps {
  seoData: SEOData;
  examTitle: string;
  slug: string;
  onChange: (seoData: SEOData) => void;
}

export default function SEOEditor({ seoData, examTitle, slug, onChange }: SEOEditorProps) {
  const [metaKeywordInput, setMetaKeywordInput] = useState("");
  const previewSlug = slug || examTitle.toLowerCase().replace(/\s+/g, "-");
  const metaDescLength = (seoData.seoDescription || "").length;

  const getDescColor = () => {
    if (metaDescLength < 120) return "text-red-600";
    if (metaDescLength > 160) return "text-orange-600";
    return "text-green-600";
  };

  const addMetaKeyword = () => {
    if (!metaKeywordInput.trim()) return;
    onChange({
      ...seoData,
      metaKeywords: [...(seoData.metaKeywords || []), metaKeywordInput.trim()],
    });
    setMetaKeywordInput("");
  };

  const removeMetaKeyword = (index: number) => {
    onChange({
      ...seoData,
      metaKeywords: seoData.metaKeywords.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">SEO Tool</h2>
        <p className="text-sm text-gray-600 mt-1">Manage search snippet content</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Focus Keyword
        </label>
        <input
          type="text"
          value={seoData.focusKeyword || ""}
          onChange={(e) => onChange({ ...seoData, focusKeyword: e.target.value })}
          placeholder="e.g., SSC CGL 2025"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Meta Description (Google, max 160 chars)
        </label>
        <textarea
          rows={3}
          maxLength={160}
          value={seoData.seoDescription || ""}
          onChange={(e) => onChange({ ...seoData, seoDescription: e.target.value })}
          placeholder="Write a concise description for Google search results."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">Recommended: 120-160 characters</p>
          <span className={`text-sm font-semibold ${getDescColor()}`}>{metaDescLength}/160</span>
        </div>

        <div className="mt-3 border border-gray-300 rounded-lg p-3 bg-gray-50">
          <p className="text-xs text-gray-400 mb-1 font-medium">Google Preview:</p>
          <div className="text-xs text-gray-500 mb-0.5">rajjobs.com › exams › {previewSlug}</div>
          <div className="text-blue-600 font-medium text-sm mb-1">{examTitle || "Exam Title"}</div>
          <div className="text-sm text-gray-700">
            {seoData.seoDescription || <span className="text-gray-400 italic">Meta description will appear here...</span>}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Meta Keywords
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={metaKeywordInput}
            onChange={(e) => setMetaKeywordInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMetaKeyword())}
            placeholder="Add keyword"
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
                x
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
