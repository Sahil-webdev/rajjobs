import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// Server-side fetch function
async function getExamData(slug: string) {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/public/exam-details/${slug}`;
    
    const response = await fetch(apiUrl, {
      cache: 'no-store', // Always fetch fresh data for SEO
    });
    
    if (!response.ok) {
      return null;
    }
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching exam data:', error);
    return null;
  }
}

// Server-side fetch function for related posts
async function getRelatedExams(slug: string) {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/public/exam-details/${slug}/related`;
    
    const response = await fetch(apiUrl, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return [];
    }
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching related exams:', error);
    return [];
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const unwrappedParams = await params;
  const examData = await getExamData(unwrappedParams.slug);

  if (!examData) {
    return {
      title: 'Exam Not Found',
      description: 'The requested exam details could not be found.',
    };
  }

  // Extract keywords from tags and content
  const keywords = [
    ...(examData.tags || []),
    examData.title,
    examData.category,
    'government jobs',
    'sarkari naukri',
    'exam notification',
    'recruitment',
  ].filter(Boolean).join(', ');

  return {
    title: examData.seoData?.metaTitle || examData.title,
    // seoDescription = separate 160-char Google-only meta desc; fallback to first 160 chars of page description
    description: examData.seoData?.seoDescription || examData.metaDescription?.slice(0, 160),
    keywords: keywords,
    authors: [{ name: examData.postedBy || 'RajJobs Admin' }],
    openGraph: {
      title: examData.seoData?.ogTitle || examData.seoData?.metaTitle || examData.title,
      description: examData.seoData?.seoDescription || examData.metaDescription?.slice(0, 160),
      images: examData.posterImage && !examData.posterImage.startsWith('data:') ? [{ url: examData.posterImage, width: 1200, height: 630 }] : [],
      type: 'article',
      publishedTime: examData.createdAt,
      modifiedTime: examData.lastUpdated,
      tags: examData.tags || [],
    },
    twitter: {
      card: 'summary_large_image',
      title: examData.seoData?.twitterTitle || examData.seoData?.metaTitle || examData.title,
      description: examData.seoData?.seoDescription || examData.metaDescription?.slice(0, 160),
      images: examData.posterImage && !examData.posterImage.startsWith('data:') ? [examData.posterImage] : [],
    },
    alternates: {
      canonical: `https://www.rajjobs.com/exams/${unwrappedParams.slug}`,
    },
    robots: {
      index: examData.status === 'published',
      follow: examData.status === 'published',
      googleBot: {
        index: examData.status === 'published',
        follow: examData.status === 'published',
      },
    },
  };
}

// Server Component (No "use client")
export default async function ExamDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = await params;
  const examData = await getExamData(unwrappedParams.slug);

  if (!examData) {
    notFound();
  }

  // Fetch related exams
  const relatedExams = await getRelatedExams(unwrappedParams.slug);

  // Debug: Log formattedNote data on website
  console.log('========================================');
  console.log('🌐 WEBSITE - Exam Data Loaded');
  console.log('========================================');
  console.log('📄 Exam Title:', examData.title);
  console.log('� Exam Slug:', examData.slug);
  console.log('📝 formattedNote present:', examData.formattedNote ? 'YES' : 'NO');
  console.log('📝 formattedNote type:', typeof examData.formattedNote);
  console.log('📝 formattedNote length:', examData.formattedNote?.length || 0);
  console.log('📝 formattedNote isString:', typeof examData.formattedNote === 'string');
  console.log('📝 formattedNote value:', examData.formattedNote);
  console.log('📝 formattedNote preview:', examData.formattedNote?.substring(0, 300) || 'Empty');
  console.log('🔍 All exam data keys:', Object.keys(examData));
  console.log('========================================');

  // Generate JSON-LD structured data for Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": examData.title,
    "description": examData.metaDescription,
    "image": examData.posterImage,
    "datePublished": examData.createdAt,
    "dateModified": examData.lastUpdated,
    "author": {
      "@type": "Person",
      "name": examData.postedBy || "RajJobs Admin"
    },
    "publisher": {
      "@type": "Organization",
      "name": "RajJobs",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.rajjobs.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.rajjobs.com/exams/${unwrappedParams.slug}`
    },
    "keywords": examData.tags?.join(', '),
    "articleSection": examData.category,
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
              {examData.seoData?.metaTitle || examData.title}
            </h1>
            <p className="text-slate-700 text-sm leading-relaxed">{examData.metaDescription}</p>
          </div>

          {/* Description - shown below title */}
          {examData.description && (
            <div className="bg-blue-50 rounded-xl border border-blue-200 shadow-sm p-6 mb-5">
              <p className="text-slate-800 text-base leading-relaxed font-medium">{examData.description}</p>
            </div>
          )}

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

          {/* Description 2 - shown below image */}
          {examData.description2 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-5">
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{examData.description2}</p>
            </div>
          )}

          {/* Main Content - formatted note displayed as primary content */}
          {examData.formattedNote && examData.formattedNote.trim().length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-5">
              <div 
                className="formatted-content prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: examData.formattedNote }}
                style={{ 
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.8',
                  color: '#1f2937'
                }}
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

          {/* Eligibility Criteria */}
          {examData.enabledSections?.eligibility && examData.eligibility && examData.eligibility.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>✅</span> Eligibility Criteria
                </h2>
              </div>
              <div className="p-5 space-y-4">
                {examData.eligibility.map((item: any, idx: number) => {
                  // Extract list items from HTML using regex
                  const listItems = item.content?.match(/<li>[\s\S]*?<\/li>/g)?.map((listItem: string) => 
                    listItem.replace(/<\/?li>/g, '').trim()
                  ) || [];
                  
                  return (
                    <div key={idx} className={idx > 0 ? 'pt-4 border-t border-slate-200' : ''}>
                      {item.description && (
                        <p className="text-sm text-slate-700 mb-3 leading-relaxed description">{item.description}</p>
                      )}
                      {item.listStyle === 'bullets' ? (
                        <ul className="space-y-2">
                          {listItems.map((point: string, pointIdx: number) => (
                            <li key={pointIdx} className="flex gap-2 text-sm text-slate-700">
                              <span className="text-slate-900 font-bold">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <ol className="space-y-2">
                          {listItems.map((point: string, pointIdx: number) => (
                            <li key={pointIdx} className="flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                                {pointIdx + 1}
                              </span>
                              <span className="text-sm text-slate-700 pt-0.5">{point}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Age Limit */}
          {examData.enabledSections?.ageLimit && examData.ageLimit && examData.ageLimit.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>🎂</span> Age Limit
                </h2>
              </div>
              <div className="p-5 space-y-4">
                {examData.ageLimit.map((item: any, idx: number) => {
                  const listItems = item.content?.match(/<li>[\s\S]*?<\/li>/g)?.map((listItem: string) => 
                    listItem.replace(/<\/?li>/g, '').trim()
                  ) || [];
                  
                  return (
                    <div key={idx} className={idx > 0 ? 'pt-4 border-t border-slate-200' : ''}>
                      {item.description && (
                        <p className="text-sm text-slate-700 mb-3 leading-relaxed description">{item.description}</p>
                      )}
                      {item.listStyle === 'bullets' ? (
                        <ul className="space-y-2">
                          {listItems.map((point: string, pointIdx: number) => (
                            <li key={pointIdx} className="flex gap-2 text-sm text-slate-700">
                              <span className="text-slate-900 font-bold">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <ol className="space-y-2">
                          {listItems.map((point: string, pointIdx: number) => (
                            <li key={pointIdx} className="flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                                {pointIdx + 1}
                              </span>
                              <span className="text-sm text-slate-700 pt-0.5">{point}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Required Documents */}
          {examData.enabledSections?.requiredDocuments && examData.requiredDocuments && examData.requiredDocuments.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>📄</span> Required Documents
                </h2>
              </div>
              <div className="p-5 space-y-4">
                {examData.requiredDocuments.map((item: any, idx: number) => {
                  const listItems = item.content?.match(/<li>[\s\S]*?<\/li>/g)?.map((listItem: string) => 
                    listItem.replace(/<\/?li>/g, '').trim()
                  ) || [];
                  
                  return (
                    <div key={idx} className={idx > 0 ? 'pt-4 border-t border-slate-200' : ''}>
                      {item.description && (
                        <p className="text-sm text-slate-700 mb-3 leading-relaxed description">{item.description}</p>
                      )}
                      {item.listStyle === 'bullets' ? (
                        <ul className="space-y-2">
                          {listItems.map((point: string, pointIdx: number) => (
                            <li key={pointIdx} className="flex gap-2 text-sm text-slate-700">
                              <span className="text-slate-900 font-bold">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <ol className="space-y-2">
                          {listItems.map((point: string, pointIdx: number) => (
                            <li key={pointIdx} className="flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                                {pointIdx + 1}
                              </span>
                              <span className="text-sm text-slate-700 pt-0.5">{point}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
          {examData.enabledSections?.salary && examData.salary && examData.salary.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>💰</span> Salary Structure
                </h2>
              </div>
              <div className="p-5 space-y-4">
                {examData.salary.map((item: any, idx: number) => {
                  const listItems = item.content?.match(/<li>[\s\S]*?<\/li>/g)?.map((listItem: string) => 
                    listItem.replace(/<\/?li>/g, '').trim()
                  ) || [];
                  
                  return (
                    <div key={idx} className={idx > 0 ? 'pt-4 border-t border-slate-200' : ''}>
                      {item.description && (
                        <p className="text-sm text-slate-700 mb-3 leading-relaxed description">{item.description}</p>
                      )}
                      {item.listStyle === 'bullets' ? (
                        <ul className="space-y-2">
                          {listItems.map((point: string, pointIdx: number) => (
                            <li key={pointIdx} className="flex gap-2 text-sm text-slate-700">
                              <span className="text-green-600 font-bold">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <ol className="space-y-2">
                          {listItems.map((point: string, pointIdx: number) => (
                            <li key={pointIdx} className="flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                                {pointIdx + 1}
                              </span>
                              <span className="text-sm text-slate-700 pt-0.5">{point}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
          {examData.enabledSections?.selectionProcess && examData.selectionProcess && examData.selectionProcess.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>🎯</span> Selection Process
                </h2>
              </div>
              <div className="p-5 space-y-4">
                {examData.selectionProcess.map((item: any, idx: number) => {
                  const listItems = item.content?.match(/<li>[\s\S]*?<\/li>/g)?.map((listItem: string) => 
                    listItem.replace(/<\/?li>/g, '').trim()
                  ) || [];
                  
                  return (
                    <div key={idx} className={idx > 0 ? 'pt-4 border-t border-slate-200' : ''}>
                      {item.description && (
                        <p className="text-sm text-slate-700 mb-3 leading-relaxed description">{item.description}</p>
                      )}
                      {item.listStyle === 'bullets' ? (
                        <ul className="space-y-2">
                          {listItems.map((point: string, pointIdx: number) => (
                            <li key={pointIdx} className="flex gap-2 text-sm text-slate-700">
                              <span className="text-purple-600 font-bold">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <ol className="space-y-2">
                          {listItems.map((point: string, pointIdx: number) => (
                            <li key={pointIdx} className="flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                                {pointIdx + 1}
                              </span>
                              <span className="text-sm text-slate-700 pt-0.5">{point}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Related Posts Section */}
          {relatedExams && relatedExams.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>🔗</span> Related Exams
                </h2>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedExams.map((exam: any) => (
                    <a
                      key={exam.slug}
                      href={`/exams/${exam.slug}`}
                      className="block border border-slate-200 rounded-lg overflow-hidden hover:border-blue-400 hover:shadow-md transition-all duration-200"
                    >
                      {/* Image */}
                      {exam.posterImage && (
                        <div className="w-full h-32 bg-slate-100 overflow-hidden">
                          <img
                            src={exam.posterImage}
                            alt={exam.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="p-4">
                        {/* Category Badge */}
                        <div className="mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                            {exam.category}
                          </span>
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-sm font-bold text-slate-900 mb-2 line-clamp-2 hover:text-blue-600">
                          {exam.title}
                        </h3>
                        
                        {/* Description */}
                        {exam.metaDescription && (
                          <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                            {exam.metaDescription}
                          </p>
                        )}
                        
                        {/* Date */}
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <span>
                            {new Date(exam.updatedAt).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          

          

        </div>
      </div>
    </>
  );
}
