"use client";

import { useState, useEffect } from "react";

interface ExamPreviewProps {
  formData: {
    title: string;
    slug: string;
    category: string;
    metaDescription: string;
    formattedNote: string;
    posterImage: string;
    status: string;
    postedBy: string;
    seoData?: {
      metaTitle?: string;
      imageAltTexts?: {
        posterImage?: string;
      };
    };
    quickHighlights?: Record<string, string>;
    importantDates?: Array<{ event: string; date: string }>;
    eligibility?: Array<{ title: string; content: string }>;
    applicationFee?: Array<{ category: string; fee: string }>;
    examPattern?: Array<{ subject: string; marks: string; duration?: string }>;
    syllabus?: Array<{ topic: string; subtopics: string }>;
    howToApply?: Array<{ step: string; description: string }>;
    enabledSections?: {
      quickHighlights?: boolean;
      importantDates?: boolean;
      eligibility?: boolean;
      applicationFee?: boolean;
      examPattern?: boolean;
      syllabus?: boolean;
      howToApply?: boolean;
    };
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function ExamPreview({ formData, isOpen, onClose }: ExamPreviewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const currentDate = new Date().toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-[9999] flex items-start justify-center overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-4xl my-8 mx-4 rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Preview</h2>
            <p className="text-sm text-slate-600 mt-1">This is how your exam will appear on the website</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors"
            title="Close preview"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview Content - Mimics website layout */}
        <div className="bg-slate-50 p-6 max-h-[80vh] overflow-y-auto">
          <div className="mx-auto max-w-2xl space-y-5">
            
            {/* Title & Meta */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  {formData.category || 'SSC'}
                </span>
                <span className="text-xs text-slate-500">
                  Updated: {currentDate}
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-600">
                  Posted by: <span className="font-semibold text-slate-900">{formData.postedBy || "J. Kaushik"}</span>
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
                {formData.seoData?.metaTitle || formData.title || "Untitled Exam"}
              </h1>
              <p className="text-slate-700 text-sm leading-relaxed">
                {formData.metaDescription || "No description provided"}
              </p>
            </div>

            {/* Banner Image */}
            {formData.posterImage && (
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img 
                  src={formData.posterImage} 
                  alt={formData.seoData?.imageAltTexts?.posterImage || `${formData.title} notification poster`}
                  className="w-full h-64 md:h-96 object-contain bg-white"
                />
              </div>
            )}

            {/* Main Content - Formatted Note */}
            {formData.formattedNote && formData.formattedNote.trim().length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div 
                  className="formatted-content prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formData.formattedNote }}
                  style={{ 
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.8',
                    color: '#1f2937'
                  }}
                />
              </div>
            )}

            {/* Quick Highlights */}
            {formData.enabledSections?.quickHighlights && formData.quickHighlights && Object.keys(formData.quickHighlights).length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>⚡</span> Quick Highlights
                  </h2>
                </div>
                <div className="p-5">
                  <table className="w-full">
                    <tbody>
                      {Object.entries(formData.quickHighlights).map(([key, value], idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                          <td className="px-3 py-2 text-sm font-semibold text-slate-700 border border-slate-200">{key}</td>
                          <td className="px-3 py-2 text-sm text-slate-900 border border-slate-200">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Important Dates */}
            {formData.enabledSections?.importantDates && formData.importantDates && formData.importantDates.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>📅</span> Important Dates
                  </h2>
                </div>
                <div className="p-5">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700 border border-slate-200">Event</th>
                        <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700 border border-slate-200">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.importantDates.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="px-3 py-2 text-sm text-slate-900 border border-slate-200">{item.event}</td>
                          <td className="px-3 py-2 text-sm text-blue-600 font-semibold border border-slate-200">{item.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Eligibility Criteria */}
            {formData.enabledSections?.eligibility && formData.eligibility && formData.eligibility.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>✅</span> Eligibility Criteria
                  </h2>
                </div>
                <div className="p-5 space-y-4">
                  {formData.eligibility.map((item, idx) => (
                    <div key={idx}>
                      <h3 className="text-sm font-bold text-slate-900 mb-2">{item.title}</h3>
                      <div 
                        className="text-sm text-slate-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: item.content }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Application Fee */}
            {formData.enabledSections?.applicationFee && formData.applicationFee && formData.applicationFee.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>💳</span> Application Fee
                  </h2>
                </div>
                <div className="p-5">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700 border border-slate-200">Category</th>
                        <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700 border border-slate-200">Fee</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.applicationFee.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="px-3 py-2 text-sm text-slate-900 border border-slate-200">{item.category}</td>
                          <td className="px-3 py-2 text-sm text-green-600 font-semibold border border-slate-200">{item.fee}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Exam Pattern */}
            {formData.enabledSections?.examPattern && formData.examPattern && formData.examPattern.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>📝</span> Exam Pattern
                  </h2>
                </div>
                <div className="p-5">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700 border border-slate-200">Subject</th>
                        <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700 border border-slate-200">Marks</th>
                        {formData.examPattern.some(item => item.duration) && (
                          <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700 border border-slate-200">Duration</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {formData.examPattern.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="px-3 py-2 text-sm text-slate-900 border border-slate-200">{item.subject}</td>
                          <td className="px-3 py-2 text-sm text-blue-600 font-semibold border border-slate-200">{item.marks}</td>
                          {formData.examPattern.some(item => item.duration) && (
                            <td className="px-3 py-2 text-sm text-slate-700 border border-slate-200">{item.duration || '-'}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Syllabus */}
            {formData.enabledSections?.syllabus && formData.syllabus && formData.syllabus.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>📚</span> Syllabus
                  </h2>
                </div>
                <div className="p-5 space-y-4">
                  {formData.syllabus.map((item, idx) => (
                    <div key={idx}>
                      <h3 className="text-sm font-bold text-slate-900 mb-2">{item.topic}</h3>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {item.subtopics}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* How to Apply */}
            {formData.enabledSections?.howToApply && formData.howToApply && formData.howToApply.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>📋</span> How to Apply
                  </h2>
                </div>
                <div className="p-5 space-y-4">
                  {formData.howToApply.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-slate-900 mb-1">{item.step}</h3>
                        <p className="text-sm text-slate-700 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state if no content */}
            {!formData.formattedNote && !formData.posterImage && (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
                <div className="text-slate-400 text-6xl mb-4">📄</div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No content to preview</h3>
                <p className="text-sm text-slate-500">Add title, description, image, or formatted content to see preview</p>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              💡 <span className="font-semibold">Tip:</span> All links and PDFs are clickable in preview
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
