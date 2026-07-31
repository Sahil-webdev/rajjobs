import React from "react";
import { cache } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";

const SITE_URL = "https://www.rajjobs.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/logo3.png`;

// Cached per server render, so metadata and page HTML use one consistent record.
const getExamData = cache(async (slug: string) => {
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
});

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

function absoluteUrl(value?: string) {
  if (!value) return undefined;
  try {
    return new URL(value, SITE_URL).toString();
  } catch {
    return undefined;
  }
}

function getArticleImage(examData: any): string {
  if (examData.posterImage) {
    const posterImage = absoluteUrl(examData.posterImage);
    if (posterImage) return posterImage;
  }
  const imageMatch = typeof examData.formattedNote === "string"
    ? examData.formattedNote.match(/<img[^>]+src=["']([^"']+)["']/i)
    : null;
  return absoluteUrl(imageMatch?.[1]) || DEFAULT_OG_IMAGE;
}

function articleDescription(examData: any) {
  return (examData.seoData?.seoDescription || examData.metaDescription || examData.title || "RajJobs exam details")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
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

  const description = articleDescription(examData);
  const canonicalUrl = `${SITE_URL}/exams/${unwrappedParams.slug}`;
  const image = getArticleImage(examData);

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
    title: examData.title,
    description,
    keywords: keywords,
    authors: [{ name: examData.postedBy || 'RajJobs Admin' }],
    openGraph: {
      title: examData.title,
      url: canonicalUrl,
      siteName: 'RajJobs',
      description,
      images: [{ url: image, width: 1200, height: 630, alt: examData.title }],
      type: 'article',
      publishedTime: examData.createdAt,
      modifiedTime: examData.lastUpdated,
      tags: examData.tags || [],
    },
    twitter: {
      card: 'summary_large_image',
      title: examData.title,
      description,
      images: [image],
    },
    alternates: {
      canonical: canonicalUrl,
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

  const canonicalUrl = `${SITE_URL}/exams/${unwrappedParams.slug}`;
  const description = articleDescription(examData);
  const image = getArticleImage(examData);
  const publishedDate = examData.createdAt || examData.updatedAt || new Date().toISOString();
  const modifiedDate = examData.lastUpdated || examData.updatedAt || publishedDate;

  // JSON-LD is emitted into the initial server HTML for article crawlers.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": examData.title,
    "description": description,
    "image": [image],
    "datePublished": publishedDate,
    "dateModified": modifiedDate,
    "author": {
      "@type": "Person",
      "name": examData.postedBy || "RajJobs Admin"
    },
    "publisher": {
      "@type": "Organization",
      "name": "RajJobs",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo3.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "keywords": examData.tags?.join(', '),
    "articleSection": examData.category,
    "inLanguage": "en-IN",
    "isAccessibleForFree": true,
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Exams", "item": `${SITE_URL}/exams` },
      { "@type": "ListItem", "position": 3, "name": examData.title, "item": canonicalUrl },
    ],
  };
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }}
      />

      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 py-6">
          
          <article itemScope itemType="https://schema.org/Article">
          {/* Title & Meta */}
          <header className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-5">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                {examData.category}
              </span>
              <time className="text-xs text-slate-500" dateTime={modifiedDate} itemProp="dateModified">
                Updated: {new Date(modifiedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </time>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-600">
                Posted by: <span className="font-semibold text-slate-900">{examData.postedBy || "Admin"}</span>
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-3" itemProp="headline">
              {examData.title}
            </h1>
            <p className="text-slate-700 text-sm leading-relaxed" itemProp="description">{description}</p>
          </header>

          {/* Main Content - formatted note displayed as primary content */}
          {examData.formattedNote && examData.formattedNote.trim().length > 0 && (
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-5" aria-label="Exam details" itemProp="articleBody">
              <div 
                className="exam-content"
                dangerouslySetInnerHTML={{ __html: examData.formattedNote }}
              />
            </section>
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

          

          

          </article>
        </div>
      </div>
    </>
  );
}

