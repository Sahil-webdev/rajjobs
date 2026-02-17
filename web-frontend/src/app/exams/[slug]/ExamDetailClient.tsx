"use client";

import React from "react";

interface ExamDetailClientProps {
  examData: any;
}

export default function ExamDetailClient({ examData }: ExamDetailClientProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-6">
        
        {/* Title & Meta */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-5">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              {examData.category}
            </span>
            <span className="text-xs text-slate-500">
              Updated: {new Date(examData.lastUpdated).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-600">
              Posted by: <span className="font-semibold text-slate-900">{examData.postedBy || "Admin"}</span>
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">{examData.title}</h1>
          <p className="text-slate-700 text-base leading-relaxed">{examData.metaDescription}</p>
        </div>

        {/* Banner Image */}
        {examData.posterImage && (
          <div className="mb-5 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <img 
              src={examData.posterImage} 
              alt={examData.seoData?.imageAltTexts?.posterImage || `${examData.title} notification poster with important dates and details`}
              className="w-full h-40 md:h-56 object-cover"
            />
          </div>
        )}

        {/* Quick Highlights */}
        {examData.enabledSections?.quickHighlights && examData.quickHighlights && Object.keys(examData.quickHighlights).length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>⚡</span> Quick Highlights
              </h2>
            </div>
            <div className="p-5">
              <table className="w-full">
                <tbody>
                  {Object.entries(examData.quickHighlights).map(([key, value]: [string, any], idx: number) => (
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
        {examData.enabledSections?.importantDates && examData.importantDates && examData.importantDates.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
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
                  {examData.importantDates.map((item: any, idx: number) => (
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

        {/* Vacancy Details */}
        {examData.enabledSections?.vacancyDetails && examData.vacancyDetails && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>👥</span> Vacancy Details
              </h2>
            </div>
            <div className="p-5">
              {examData.vacancyDetails.description && (
                <p className="text-slate-700 text-sm mb-4 leading-relaxed">{examData.vacancyDetails.description}</p>
              )}
              {examData.vacancyDetails.breakdown && examData.vacancyDetails.breakdown.length > 0 && (
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700 border border-slate-200">Post Name</th>
                      <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700 border border-slate-200">Vacancies</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examData.vacancyDetails.breakdown.map((item: any, idx: number) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="px-3 py-2 text-sm text-slate-900 border border-slate-200">{item.post}</td>
                        <td className="px-3 py-2 text-sm text-blue-600 font-semibold border border-slate-200">{item.vacancies}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Eligibility Criteria */}
        {examData.enabledSections?.eligibility && examData.eligibility && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>✅</span> Eligibility Criteria
              </h2>
            </div>
            <div className="p-5 space-y-4">
              {examData.eligibility.qualification && (
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">Educational Qualification</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">{examData.eligibility.qualification}</p>
                </div>
              )}
              {examData.eligibility.ageLimit && (
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">Age Limit</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-xs text-slate-600 mb-1">Minimum Age</div>
                      <div className="text-xl font-bold text-slate-900">{examData.eligibility.ageLimit.minimum} years</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-xs text-slate-600 mb-1">Maximum Age</div>
                      <div className="text-xl font-bold text-slate-900">{examData.eligibility.ageLimit.maximum} years</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-xs text-slate-600 mb-1">Relaxation</div>
                      <div className="text-xs font-semibold text-slate-700">{examData.eligibility.ageLimit.relaxation}</div>
                    </div>
                  </div>
                </div>
              )}
              {examData.eligibility.nationality && (
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">Nationality</h3>
                  <p className="text-sm text-slate-700">{examData.eligibility.nationality}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Exam Pattern */}
        {examData.enabledSections?.examPattern && examData.examPattern && examData.examPattern.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>📝</span> Exam Pattern
              </h2>
            </div>
            <div className="p-5 space-y-3">
              {examData.examPattern.map((tier: any, idx: number) => (
                <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-2 border-b border-slate-200">
                    <h3 className="font-bold text-sm text-slate-900">{tier.tier}</h3>
                  </div>
                  <div className="p-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {tier.mode && <div><span className="font-semibold text-slate-700">Mode:</span> <span className="text-slate-900">{tier.mode}</span></div>}
                      {tier.duration && <div><span className="font-semibold text-slate-700">Duration:</span> <span className="text-slate-900">{tier.duration}</span></div>}
                      {tier.subjects && <div className="md:col-span-2"><span className="font-semibold text-slate-700">Subjects:</span> <span className="text-slate-900">{tier.subjects}</span></div>}
                      {tier.questions && <div><span className="font-semibold text-slate-700">Questions:</span> <span className="text-slate-900">{tier.questions}</span></div>}
                      {tier.marks && <div><span className="font-semibold text-slate-700">Marks:</span> <span className="text-slate-900">{tier.marks}</span></div>}
                      {tier.negativeMarking && <div className="md:col-span-2"><span className="font-semibold text-slate-700">Negative Marking:</span> <span className="text-slate-900">{tier.negativeMarking}</span></div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Salary */}
        {examData.enabledSections?.salary && examData.salary && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>💰</span> Salary Structure
              </h2>
            </div>
            <div className="p-5">
              {examData.salary.payScale && (
                <div className="mb-3">
                  <p className="text-slate-900 font-semibold text-base">{examData.salary.payScale}</p>
                </div>
              )}
              {examData.salary.details && examData.salary.details.length > 0 && (
                <table className="w-full mb-3">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700 border border-slate-200">Post</th>
                      <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700 border border-slate-200">Pay Level</th>
                      <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700 border border-slate-200">Salary Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examData.salary.details.map((item: any, idx: number) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="px-3 py-2 text-sm text-slate-900 border border-slate-200">{item.post}</td>
                        <td className="px-3 py-2 text-sm text-slate-900 border border-slate-200">{item.payLevel}</td>
                        <td className="px-3 py-2 text-sm text-slate-900 font-semibold border border-slate-200">{item.salary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {examData.salary.benefits && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-700">{examData.salary.benefits}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Application Fees */}
        {examData.enabledSections?.applicationFees && examData.applicationFees && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>💳</span> Application Fees
              </h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {examData.applicationFees.general && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1">General/OBC Candidates</div>
                    <div className="text-xl font-bold text-slate-900">{examData.applicationFees.general}</div>
                  </div>
                )}
                {examData.applicationFees.sc_st && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1">SC/ST/Female/PwD</div>
                    <div className="text-xl font-bold text-slate-900">{examData.applicationFees.sc_st}</div>
                  </div>
                )}
              </div>
              {examData.applicationFees.paymentMode && (
                <div className="mb-3">
                  <h3 className="font-semibold text-sm text-slate-900 mb-1">Payment Mode</h3>
                  <p className="text-xs text-slate-700">{examData.applicationFees.paymentMode}</p>
                </div>
              )}
              {examData.applicationFees.note && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-900"><strong>Note:</strong> {examData.applicationFees.note}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* How to Apply */}
        {examData.enabledSections?.howToApply && examData.howToApply && examData.howToApply.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>📝</span> How to Apply
              </h2>
            </div>
            <div className="p-5">
              <ol className="space-y-2">
                {examData.howToApply.map((step: any, idx: number) => (
                  <li key={idx} className="flex gap-3">
                    <div className="flex-shrink-0 w-7 h-7 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-xs">
                      {step.step}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-sm text-slate-700 leading-relaxed">{step.instruction}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* Important Links */}
        {examData.enabledSections?.importantLinks && examData.importantLinks && examData.importantLinks.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>🔗</span> Important Links
              </h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {examData.importantLinks.map((link: any, idx: number) => (
                  <a
                    key={idx}
                    href={link.type === 'pdf' ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${link.url}` : link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{link.icon || (link.type === 'pdf' ? '📄' : '🔗')}</span>
                      <span className="font-medium text-sm text-slate-900">{link.label}</span>
                    </span>
                    {link.type === 'pdf' ? (
                      <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FAQs */}
        {examData.enabledSections?.faqs && examData.faqs && examData.faqs.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>❓</span> Frequently Asked Questions
              </h2>
            </div>
            <div className="p-5 space-y-3">
              {examData.faqs.map((faq: any, idx: number) => (
                <div key={idx} className="pb-3 border-b border-slate-200 last:border-0 last:pb-0">
                  <h3 className="font-bold text-sm text-slate-900 mb-1.5 flex items-start gap-2">
                    <span className="text-slate-600">Q{idx + 1}.</span>
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed ml-7">
                    <span className="text-slate-900 font-semibold">Ans:</span> {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {examData.tags && examData.tags.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>🏷️</span> Tags
              </h2>
            </div>
            <div className="p-5">
              <div className="flex flex-wrap gap-2">
                {examData.tags.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
