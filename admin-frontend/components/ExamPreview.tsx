"use client";

import React, { useState, useEffect } from "react";

interface ExamPreviewProps {
  formData: {
    title: string;
    slug: string;
    category: string;
    metaDescription: string;
    formattedNote: string;
    status: string;
    postedBy: string;
    jobDetails?: {
      isJobPosting?: boolean;
      organizationName?: string;
      lastDateToApply?: string;
      totalPosts?: string | number;
      minSalary?: string | number;
      maxSalary?: string | number;
      employmentType?: string;
    };
    faqs?: Array<{ question: string; answer: string }>;
    seoData?: {
      seoDescription?: string;
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

  // Provide default values for optional properties to avoid TypeScript errors
  const enabledSections = formData.enabledSections || {};
  const seoData = formData.seoData || {};
  const jobDetails = formData.jobDetails;
  const showJobHighlights = Boolean(
    jobDetails?.isJobPosting
    && jobDetails.organizationName
    && jobDetails.lastDateToApply
    && Number(jobDetails.totalPosts) > 0
  );
  const jobHighlightsMarker = "[[JOB_HIGHLIGHTS]]";
  const hasJobHighlightsMarker = formData.formattedNote.includes(jobHighlightsMarker);
  const articleParts = formData.formattedNote.split(/<p[^>]*>\s*\[\[JOB_HIGHLIGHTS\]\]\s*<\/p>|\[\[JOB_HIGHLIGHTS\]\]/gi);
  
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
                {formData.title || "Untitled Exam"}
              </h1>
              <p className="text-slate-700 text-sm leading-relaxed">
                {seoData.seoDescription || formData.metaDescription || "No description provided"}
              </p>
            </div>

            {showJobHighlights && !hasJobHighlightsMarker && (
              <section className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
                  <h2 className="text-base font-bold text-blue-950">Job Highlights</h2>
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                  <div className="p-4">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Organization</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">{jobDetails!.organizationName}</dd>
                  </div>
                  <div className="p-4">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Posts</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">{Number(jobDetails!.totalPosts).toLocaleString('en-IN')}</dd>
                  </div>
                  <div className="p-4 border-t border-slate-200">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last Date to Apply</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">{new Date(jobDetails!.lastDateToApply!).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</dd>
                  </div>
                  <div className="p-4 border-t border-slate-200">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Employment Type</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">{(jobDetails!.employmentType || 'FULL_TIME').replace(/_/g, ' ')}</dd>
                  </div>
                  {(jobDetails!.minSalary != null && jobDetails!.minSalary !== '' || jobDetails!.maxSalary != null && jobDetails!.maxSalary !== '') && (
                    <div className="p-4 border-t border-slate-200 sm:col-span-2">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Monthly Salary</dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-900">
                        ₹{Number(jobDetails!.minSalary || jobDetails!.maxSalary).toLocaleString('en-IN')}
                        {jobDetails!.maxSalary != null && jobDetails!.maxSalary !== '' && jobDetails!.maxSalary !== jobDetails!.minSalary ? ` – ₹${Number(jobDetails!.maxSalary).toLocaleString('en-IN')}` : ''}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
            )}

            {/* Main Content - Formatted Note */}
            {formData.formattedNote && formData.formattedNote.trim().length > 0 && articleParts.map((part, index) => (
              <React.Fragment key={index}>
                {part.trim() && <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6"><div className="formatted-content prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: part }} style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: '#1f2937' }} /></div>}
                {showJobHighlights && hasJobHighlightsMarker && index < articleParts.length - 1 && (
                  <section className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 bg-blue-50 border-b border-blue-100"><h2 className="text-base font-bold text-blue-950">Job Highlights</h2></div>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                      <div className="p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Organization</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{jobDetails!.organizationName}</dd></div>
                      <div className="p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Posts</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{Number(jobDetails!.totalPosts).toLocaleString('en-IN')}</dd></div>
                      <div className="p-4 border-t border-slate-200"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last Date to Apply</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{new Date(jobDetails!.lastDateToApply!).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</dd></div>
                      <div className="p-4 border-t border-slate-200"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Employment Type</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{(jobDetails!.employmentType || 'FULL_TIME').replace(/_/g, ' ')}</dd></div>
                    </dl>
                  </section>
                )}
              </React.Fragment>
            ))}

            {formData.faqs && formData.faqs.length > 0 && (
              <section className="bg-blue-50 rounded-xl border border-blue-200 p-5">
                <h2 className="text-lg font-bold text-blue-950 mb-3">Frequently Asked Questions</h2>
                <div className="divide-y divide-blue-200 border-y border-blue-200">
                  {formData.faqs.map((faq, index) => (
                    <details key={index} className="py-3">
                      <summary className="cursor-pointer font-semibold text-blue-900">{faq.question || `Question ${index + 1}`}</summary>
                      <p className="mt-2 mb-0 text-sm leading-6 text-slate-700 whitespace-pre-line">{faq.answer || 'Answer will appear here.'}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* Quick Highlights */}
            {enabledSections.quickHighlights && formData.quickHighlights && Object.keys(formData.quickHighlights).length > 0 && (
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
            {enabledSections.importantDates && formData.importantDates && formData.importantDates.length > 0 && (
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
            {enabledSections.eligibility && formData.eligibility && formData.eligibility.length > 0 && (
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
            {enabledSections.applicationFee && formData.applicationFee && formData.applicationFee.length > 0 && (
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
            {enabledSections.examPattern && formData.examPattern && formData.examPattern.length > 0 && (
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
                        {formData.examPattern?.some(item => item.duration) && (
                          <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700 border border-slate-200">Duration</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {formData.examPattern.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="px-3 py-2 text-sm text-slate-900 border border-slate-200">{item.subject}</td>
                          <td className="px-3 py-2 text-sm text-blue-600 font-semibold border border-slate-200">{item.marks}</td>
                          {formData.examPattern?.some(item => item.duration) && (
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
            {enabledSections.syllabus && formData.syllabus && formData.syllabus.length > 0 && (
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
            {enabledSections.howToApply && formData.howToApply && formData.howToApply.length > 0 && (
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
            {!formData.formattedNote && (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
                <div className="text-slate-400 text-6xl mb-4">📄</div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No content to preview</h3>
                <p className="text-sm text-slate-500">Add title or formatted content to see preview</p>
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

