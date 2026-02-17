import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ExamDetailClient from './ExamDetailClient';

// Fetch exam data server-side
async function getExamData(slug: string) {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/public/exam-details/${slug}`;
    
    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 } // Revalidate every hour
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

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const examData = await getExamData(params.slug);
  
  if (!examData) {
    return {
      title: 'Exam Not Found',
      description: 'The requested exam details could not be found.'
    };
  }
  
  const metaTitle = examData.seoData?.metaTitle || `${examData.title} - Notification, Dates & Syllabus | RajJobs`;
  const metaDescription = examData.metaDescription || `Get complete details about ${examData.title} including notification, important dates, eligibility, syllabus, and application process.`;
  const keywords = [
    examData.title,
    examData.category,
    examData.seoData?.focusKeyword,
    ...(examData.seoData?.lsiKeywords || []),
    ...(examData.seoData?.metaKeywords || []),
    'exam notification',
    'govt job',
    'apply online'
  ].filter(Boolean);
  
  const imageAlt = examData.seoData?.imageAltTexts?.posterImage || `${examData.title} notification poster`;
  const canonicalUrl = `https://rajjobs.com/exams/${params.slug}`;
  
  return {
    title: metaTitle,
    description: metaDescription,
    keywords: keywords.join(', '),
    
    // OpenGraph for social media
    openGraph: {
      title: examData.seoData?.openGraph?.title || metaTitle,
      description: examData.seoData?.openGraph?.description || metaDescription,
      images: [
        {
          url: examData.posterImage || '/logo.png',
          width: 1200,
          height: 630,
          alt: imageAlt
        }
      ],
      type: 'article',
      siteName: 'RajJobs',
      locale: 'en_IN',
      url: canonicalUrl
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: examData.seoData?.twitterCard?.title || metaTitle,
      description: examData.seoData?.twitterCard?.description || metaDescription,
      images: [examData.posterImage || '/logo.png'],
      creator: '@rajjobs'
    },
    
    // Canonical URL
    alternates: {
      canonical: canonicalUrl
    },
    
    // Additional metadata
    category: examData.category,
    authors: [{ name: examData.postedBy || 'RajJobs Admin' }],
    publisher: 'RajJobs',
    robots: {
      index: examData.status === 'published',
      follow: examData.status === 'published',
      googleBot: {
        index: examData.status === 'published',
        follow: examData.status === 'published'
      }
    }
  };
}

// Server component - main page
export default async function ExamDetailPage({ params }: { params: { slug: string } }) {
  const examData = await getExamData(params.slug);
  
  if (!examData) {
    notFound();
  }
  
  // Generate Schema.org JSON-LD
  const schema = examData.seoData?.schemaMarkup ? JSON.parse(examData.seoData.schemaMarkup) : {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": examData.title,
    "description": examData.metaDescription,
    "startDate": examData.importantDates?.[0]?.date || new Date().toISOString(),
    "location": {
      "@type": "VirtualLocation",
      "url": `https://rajjobs.com/exams/${params.slug}`
    },
    "image": examData.posterImage || "",
    "organizer": {
      "@type": "Organization",
      "name": examData.quickHighlights?.organization || examData.category,
      "url": "https://rajjobs.com"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "url": `https://rajjobs.com/exams/${params.slug}`
    }
  };
  
  // Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://rajjobs.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Exams",
        "item": "https://rajjobs.com/exams"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": examData.category,
        "item": `https://rajjobs.com/exams?category=${examData.category}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": examData.title,
        "item": `https://rajjobs.com/exams/${params.slug}`
      }
    ]
  };
  
  return (
    <>
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      {/* Client component for interactive features */}
      <ExamDetailClient examData={examData} />
    </>
  );
}
