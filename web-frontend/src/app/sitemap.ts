import { MetadataRoute } from 'next'

// Fetch all published exams
async function getExams() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/public/exam-details`,
      { next: { revalidate: 3600 } }
    );
    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Error fetching exams for sitemap:', error);
    return [];
  }
}

// Fetch all courses
async function getCourses() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/public/courses`,
      { next: { revalidate: 3600 } }
    );
    const courses = await response.json();
    return Array.isArray(courses) ? courses : [];
  } catch (error) {
    console.error('Error fetching courses for sitemap:', error);
    return [];
  }
}

// Fetch all test series
async function getTestSeries() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/public/test-series`,
      { next: { revalidate: 3600 } }
    );
    const testSeries = await response.json();
    return Array.isArray(testSeries) ? testSeries : [];
  } catch (error) {
    console.error('Error fetching test series for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://rajjobs.com';
  
  // Fetch dynamic content
  const exams = await getExams();
  const courses = await getCourses();
  const testSeries = await getTestSeries();
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/exams`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/testseries`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/downloads`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];
  
  // Exam pages
  const examPages = exams.map((exam: any) => ({
    url: `${baseUrl}/exams/${exam.slug}`,
    lastModified: exam.lastUpdated ? new Date(exam.lastUpdated) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  // Course pages (if they exist)
  const coursePages = courses.map((course: any) => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified: course.updatedAt ? new Date(course.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  
  // Test series pages (if they exist)
  const testSeriesPages = testSeries.map((test: any) => ({
    url: `${baseUrl}/testseries/${test._id}`,
    lastModified: test.updatedAt ? new Date(test.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  
  // Category pages
  const categories = ['SSC', 'UPSC', 'Railway', 'Banking', 'Teacher', 'Defence'];
  const categoryPages = categories.map(category => ({
    url: `${baseUrl}/exams?category=${category}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));
  
  // Combine all pages
  return [
    ...staticPages,
    ...categoryPages,
    ...examPages,
    ...coursePages,
    ...testSeriesPages,
  ];
}
