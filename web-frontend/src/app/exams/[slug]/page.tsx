"use client";
import React, { useEffect, useState } from "react";
import { notFound } from "next/navigation";

// Fetch exam data from backend
const getExamData = async (slug: string) => {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/public/exam-details/${slug}`;
    console.log('🔍 Fetching exam from:', apiUrl);
    
    const response = await fetch(apiUrl);
    console.log('📡 Response status:', response.status);
    
    const result = await response.json();
    console.log('✅ API Response:', result);
    
    if (result.success) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.error('❌ Error fetching exam data:', error);
    return null;
  }
};

export default function ExamDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [examData, setExamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const unwrappedParams = React.use(params);

  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching exam with slug:', unwrappedParams.slug);
      const data = await getExamData(unwrappedParams.slug);
      console.log('Exam data received:', data);
      if (!data) {
        console.log('No data found, calling notFound()');
        notFound();
      }
      setExamData(data);
      setLoading(false);
    };

    fetchData();
  }, [unwrappedParams.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading exam details...</p>
        </div>
      </div>
    );
  }

  if (!examData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-6">
        
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
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">{examData.title}</h1>
          <p className="text-slate-700 text-sm leading-relaxed">{examData.metaDescription}</p>
        </div>

        {/* Banner Image */}
        {examData.posterImage && (
          <div className="mb-5 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <img 
              src={examData.posterImage} 
              alt={examData.seoData?.imageAltTexts?.posterImage || `${examData.title} notification poster with important dates and details`}
              className="w-full h-64 md:h-96 object-contain bg-white"
            />
          </div>
        )}

        {/* Quick Highlights */}
        {examData.enabledSections?.quickHighlights && examData.quickHighlights && Object.keys(examData.quickHighlights).length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
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
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
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
        {examData.enabledSections?.eligibility && examData.eligibility?.content && (() => {
          // Extract list items from HTML using regex
          const listItems = examData.eligibility.content.match(/<li>[\s\S]*?<\/li>/g)?.map((item: string) => 
            item.replace(/<\/?li>/g, '').trim()
          ) || [];
          
          return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>✅</span> Eligibility Criteria
                </h2>
              </div>
              <div className="p-5">
                {examData.eligibility.description && (
                  <p className="text-sm text-slate-700 mb-4 leading-relaxed">{examData.eligibility.description}</p>
                )}
                {examData.eligibility.listStyle === 'bullets' ? (
                  <ul className="space-y-2">
                    {listItems.map((item: string, idx: number) => (
                      <li key={idx} className="flex gap-2 text-sm text-slate-700">
                        <span className="text-slate-900 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ol className="space-y-2">
                    {listItems.map((item: string, idx: number) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-slate-700 pt-0.5">{item}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          );
        })()}

        {/* Age Limit (New Separate Section) */}
        {examData.enabledSections?.ageLimit && examData.ageLimit?.content && (() => {
          // Extract list items from HTML using regex
          const listItems = examData.ageLimit.content.match(/<li>[\s\S]*?<\/li>/g)?.map((item: string) => 
            item.replace(/<\/?li>/g, '').trim()
          ) || [];
          
          return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>🎂</span> Age Limit
                </h2>
              </div>
              <div className="p-5">
                {examData.ageLimit.description && (
                  <p className="text-sm text-slate-700 mb-4 leading-relaxed">{examData.ageLimit.description}</p>
                )}
                {examData.ageLimit.listStyle === 'bullets' ? (
                  <ul className="space-y-2">
                    {listItems.map((item: string, idx: number) => (
                      <li key={idx} className="flex gap-2 text-sm text-slate-700">
                        <span className="text-slate-900 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ol className="space-y-2">
                    {listItems.map((item: string, idx: number) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-slate-700 pt-0.5">{item}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          );
        })()}

        {/* Required Documents (New Section) */}
        {examData.enabledSections?.requiredDocuments && examData.requiredDocuments?.content && (() => {
          // Extract list items from HTML using regex
          const listItems = examData.requiredDocuments.content.match(/<li>[\s\S]*?<\/li>/g)?.map((item: string) => 
            item.replace(/<\/?li>/g, '').trim()
          ) || [];
          
          return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>📄</span> Required Documents
                </h2>
              </div>
              <div className="p-5">
                {examData.requiredDocuments.description && (
                  <p className="text-sm text-slate-700 mb-4 leading-relaxed">{examData.requiredDocuments.description}</p>
                )}
                {examData.requiredDocuments.listStyle === 'bullets' ? (
                  <ul className="space-y-2">
                    {listItems.map((item: string, idx: number) => (
                      <li key={idx} className="flex gap-2 text-sm text-slate-700">
                        <span className="text-slate-900 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ol className="space-y-2">
                    {listItems.map((item: string, idx: number) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-slate-700 pt-0.5">{item}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          );
        })()}

        {/* Exam Pattern */}
        {examData.enabledSections?.examPattern && examData.examPattern && examData.examPattern.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
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
        {examData.enabledSections?.salary && examData.salary?.content && (() => {
          // Extract list items from HTML using regex
          const listItems = examData.salary.content.match(/<li>[\s\S]*?<\/li>/g)?.map((item: string) => 
            item.replace(/<\/?li>/g, '').trim()
          ) || [];
          
          return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>💰</span> Salary Structure
                </h2>
              </div>
              <div className="p-5">
                {examData.salary.description && (
                  <p className="text-sm text-slate-700 mb-4 leading-relaxed">{examData.salary.description}</p>
                )}
                {examData.salary.listStyle === 'bullets' ? (
                  <ul className="space-y-2">
                    {listItems.map((item: string, idx: number) => (
                      <li key={idx} className="flex gap-2 text-sm text-slate-700">
                        <span className="text-green-600 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ol className="space-y-2">
                    {listItems.map((item: string, idx: number) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-slate-700 pt-0.5">{item}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          );
        })()}

        {/* Syllabus */}
        {examData.enabledSections?.syllabus && examData.syllabus?.tier1 && examData.syllabus.tier1.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>📚</span> Syllabus
              </h2>
            </div>
            <div className="p-5 space-y-3">
              {examData.syllabus.tier1.map((item: any, idx: number) => (
                <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-amber-50 px-3 py-2 border-b border-amber-200">
                    <h3 className="font-bold text-sm text-slate-900">{item.subject}</h3>
                  </div>
                  <div className="p-3 bg-white">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{item.topics}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selection Process */}
        {examData.enabledSections?.selectionProcess && examData.selectionProcess?.content && (() => {
          // Extract list items from HTML using regex
          const listItems = examData.selectionProcess.content.match(/<li>[\s\S]*?<\/li>/g)?.map((item: string) => 
            item.replace(/<\/?li>/g, '').trim()
          ) || [];
          
          return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>🎯</span> Selection Process
                </h2>
              </div>
              <div className="p-5">
                {examData.selectionProcess.description && (
                  <p className="text-sm text-slate-700 mb-4 leading-relaxed">{examData.selectionProcess.description}</p>
                )}
                {examData.selectionProcess.listStyle === 'bullets' ? (
                  <ul className="space-y-2">
                    {listItems.map((item: string, idx: number) => (
                      <li key={idx} className="flex gap-2 text-sm text-slate-700">
                        <span className="text-purple-600 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ol className="space-y-2">
                    {listItems.map((item: string, idx: number) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-slate-700 pt-0.5">{item}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          );
        })()}

        {/* Previous Year Cutoff */}
        {examData.enabledSections?.previousCutoff && examData.previousCutoff?.content && (() => {
          // Extract list items from HTML using regex
          const listItems = examData.previousCutoff.content.match(/<li>[\s\S]*?<\/li>/g)?.map((item: string) => 
            item.replace(/<\/?li>/g, '').trim()
          ) || [];
          
          return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>📊</span> Previous Year Cutoff
                </h2>
              </div>
              <div className="p-5">
                {examData.previousCutoff.description && (
                  <p className="text-sm text-slate-700 mb-4 leading-relaxed">{examData.previousCutoff.description}</p>
                )}
                {examData.previousCutoff.listStyle === 'bullets' ? (
                  <ul className="space-y-2">
                    {listItems.map((item: string, idx: number) => (
                      <li key={idx} className="flex gap-2 text-sm text-slate-700">
                        <span className="text-red-600 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ol className="space-y-2">
                    {listItems.map((item: string, idx: number) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-slate-700 pt-0.5">{item}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          );
        })()}

        {/* Application Fees */}
        {examData.enabledSections?.applicationFees && examData.applicationFees?.content && (() => {
          // Extract list items from HTML using regex
          const listItems = examData.applicationFees.content.match(/<li>[\s\S]*?<\/li>/g)?.map((item: string) => 
            item.replace(/<\/?li>/g, '').trim()
          ) || [];
          
          return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>💳</span> Application Fees
                </h2>
              </div>
              <div className="p-5">
                {examData.applicationFees.description && (
                  <p className="text-sm text-slate-700 mb-4 leading-relaxed">{examData.applicationFees.description}</p>
                )}
                {examData.applicationFees.listStyle === 'bullets' ? (
                  <ul className="space-y-2">
                    {listItems.map((item: string, idx: number) => (
                      <li key={idx} className="flex gap-2 text-sm text-slate-700">
                        <span className="text-green-600 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ol className="space-y-2">
                    {listItems.map((item: string, idx: number) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-slate-700 pt-0.5">{item}</span>
                      </li>
                    ))}
                  </ol>
                )}
                {examData.applicationFees.note && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-900"><strong>Note:</strong> {examData.applicationFees.note}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* How to Apply */}
        {examData.enabledSections?.howToApply && examData.howToApply?.content && (() => {
          // Extract list items from HTML using regex
          const listItems = examData.howToApply.content.match(/<li>[\s\S]*?<\/li>/g)?.map((item: string) => 
            item.replace(/<\/?li>/g, '').trim()
          ) || [];
          
          return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>📝</span> How to Apply
                </h2>
              </div>
              <div className="p-5">
                {examData.howToApply.description && (
                  <p className="text-sm text-slate-700 mb-4 leading-relaxed">{examData.howToApply.description}</p>
                )}
                {examData.howToApply.listStyle === 'bullets' ? (
                  <ul className="space-y-2">
                    {listItems.map((item: string, idx: number) => (
                      <li key={idx} className="flex gap-2 text-sm text-slate-700">
                        <span className="text-cyan-600 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ol className="space-y-2">
                    {listItems.map((item: string, idx: number) => (
                      <li key={idx} className="flex gap-3">
                        <div className="flex-shrink-0 w-7 h-7 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className="text-sm text-slate-700 leading-relaxed">{item}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          );
        })()}

        {/* Important Links */}
        {examData.enabledSections?.importantLinks && examData.importantLinks && examData.importantLinks.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>🔗</span> Important Links
              </h2>
            </div>
            <div className="p-5">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700 border border-slate-200">Link Name</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-slate-700 border border-slate-200 w-32">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examData.importantLinks.map((link: any, idx: number) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="px-4 py-2 text-sm text-slate-900 border border-slate-200">{link.label}</td>
                        <td className="px-4 py-2 text-center border border-slate-200">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            Click Here
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* FAQs */}
        {examData.enabledSections?.faqs && examData.faqs && examData.faqs.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
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
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
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
