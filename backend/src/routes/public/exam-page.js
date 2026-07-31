const express = require('express');
const router = express.Router();
const ExamDetail = require('../../models/ExamDetail');
const asyncHandler = require('../../utils/asyncHandler');

const SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://www.rajjobs.com').replace(/\/$/, '');
const GA_MEASUREMENT_ID = 'G-V3KR48H637';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function plainText(html = '') {
  return String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function absoluteUrl(value) {
  if (!value) return null;
  try {
    return new URL(value, SITE_URL).toString();
  } catch {
    return null;
  }
}

function articleImage(formattedNote) {
  const match = String(formattedNote || '').match(/<img[^>]+src=["']([^"']+)["']/i);
  return absoluteUrl(match?.[1]) || `${SITE_URL}/logo3.png`;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(date);
}

function jsonForScript(value) {
  return JSON.stringify(value, null, 2).replace(/</g, '\\u003c');
}

function pageTemplate(exam, relatedExams) {
  const canonicalUrl = `${SITE_URL}/exams/${encodeURIComponent(exam.slug)}`;
  const description = plainText(exam.seoData?.seoDescription || exam.metaDescription || exam.formattedNote || exam.title)
    .slice(0, 160);
  const keywords = [
    ...(exam.seoData?.metaKeywords || []),
    exam.title,
    exam.category,
    'government jobs',
    'sarkari naukri',
    'exam notification',
  ].filter(Boolean).join(', ');
  const image = articleImage(exam.formattedNote);
  const publishedDate = (exam.createdAt || exam.updatedAt || new Date()).toISOString();
  const modifiedDate = (exam.updatedAt || exam.createdAt || new Date()).toISOString();
  const author = exam.postedBy || 'RajJobs Admin';
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: exam.title,
    description,
    image: [image],
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: { '@type': 'Person', name: author },
    publisher: {
      '@type': 'Organization',
      name: 'RajJobs',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo3.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    articleSection: exam.category,
    keywords,
    inLanguage: 'en-IN',
    isAccessibleForFree: true,
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Exams', item: `${SITE_URL}/exams` },
      { '@type': 'ListItem', position: 3, name: exam.title, item: canonicalUrl },
    ],
  };
  const relatedHtml = relatedExams.length
    ? relatedExams.map((item) => `
          <li>
            <a href="/exams/${encodeURIComponent(item.slug)}">${escapeHtml(item.title)}</a>
            <span>${escapeHtml(item.category)}</span>
          </li>`).join('')
    : '<li class="empty">More exam notifications will appear here.</li>';

  // formattedNote is authored by authenticated administrators in CKEditor and is
  // intentionally preserved as HTML so article tables, links and R2 images render.
  const articleBody = exam.formattedNote?.trim()
    ? exam.formattedNote
    : '<p>Exam details will be updated shortly.</p>';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(exam.title)} | RajJobs</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="keywords" content="${escapeHtml(keywords)}">
  <meta name="author" content="${escapeHtml(author)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonicalUrl}">

  <meta property="og:type" content="article">
  <meta property="og:site_name" content="RajJobs">
  <meta property="og:title" content="${escapeHtml(exam.title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="article:published_time" content="${publishedDate}">
  <meta property="article:modified_time" content="${modifiedDate}">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(exam.title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">

  <link rel="icon" href="/logo2.png">
  <link rel="stylesheet" href="/_render/exam-page.css">
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}');
  </script>
  <script type="application/ld+json">${jsonForScript(articleSchema)}</script>
  <script type="application/ld+json">${jsonForScript(breadcrumbSchema)}</script>
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="/" aria-label="RajJobs home">
        <img src="/logo3.png" alt="RajJobs">
      </a>
      <nav aria-label="Main navigation">
        <a href="/">Home</a>
        <a href="/courses">Courses</a>
        <a class="active" href="/exams">Exams</a>
        <a href="/testseries">Test Series</a>
      </nav>
    </div>
  </header>

  <main class="page-shell">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="/">Home</a><span>/</span><a href="/exams">Exams</a><span>/</span><span>${escapeHtml(exam.title)}</span>
    </nav>
    <div class="content-grid">
      <article class="article-card" itemscope itemtype="https://schema.org/Article">
        <header class="article-header">
          <div class="article-meta">
            <span class="category" itemprop="articleSection">${escapeHtml(exam.category)}</span>
            <time datetime="${modifiedDate}" itemprop="dateModified">Updated: ${formatDate(modifiedDate)}</time>
            <span>Posted by ${escapeHtml(author)}</span>
          </div>
          <h1 itemprop="headline">${escapeHtml(exam.title)}</h1>
          <p class="summary" itemprop="description">${escapeHtml(description)}</p>
        </header>
        <section class="article-content" itemprop="articleBody">
          ${articleBody}
        </section>
      </article>

      <aside class="sidebar" aria-label="Related exams">
        <section class="related-card">
          <h2>Related Exams</h2>
          <ul>${relatedHtml}
          </ul>
        </section>
      </aside>
    </div>
  </main>

  <footer class="site-footer">
    <p>© ${new Date().getFullYear()} RajJobs. All rights reserved.</p>
  </footer>
</body>
</html>`;
}

// This route is proxied by the Next.js frontend for /exams/:slug. It deliberately
// returns traditional server HTML with no React or Next.js hydration payload.
router.get('/exams/:slug', asyncHandler(async (req, res) => {
  const exam = await ExamDetail.findOne({ slug: req.params.slug, status: 'published' }).lean();
  if (!exam) {
    return res.status(404).type('html').send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Exam Not Found | RajJobs</title></head>
<body><main><h1>Exam Not Found</h1><p>The requested exam details could not be found.</p><a href="/exams">Browse exams</a></main></body></html>`);
  }

  const relatedExams = await ExamDetail.find({
    status: 'published',
    category: exam.category,
    slug: { $ne: exam.slug },
  })
    .sort({ updatedAt: -1 })
    .limit(4)
    .select('title slug category')
    .lean();

  res.status(200)
    .type('html')
    .set('Cache-Control', 'public, max-age=0, s-maxage=300')
    .send(pageTemplate(exam, relatedExams));
}));

module.exports = router;
