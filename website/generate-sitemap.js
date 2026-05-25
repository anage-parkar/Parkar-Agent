// PARKAR SITEMAP GENERATOR
// Run this script before every deployment: node generate-sitemap.js
// To exclude a specific page, add its path to the MANUAL_EXCLUDE array below.
// To change a folder's priority or changefreq, edit the PRIORITY_MAP object below.
// changefreq guide:
//   weekly  — homepage and blog posts only (change frequently)
//   monthly — resources hub (changes when new content is added)
//   yearly  — all other pages (solutions, platforms, industries, about, contact, case studies)

const MANUAL_EXCLUDE = [
  // Add file paths here to manually exclude pages from the sitemap
  // Example: 'solutions/gcc.html',
  // Example: 'company/careers.html',
  // Example: 'industries/retail.html',
];

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.parkar.in';
const ROOT = __dirname;
const TODAY = new Date().toISOString().split('T')[0];

// Priority map — first match wins (order matters)
const PRIORITY_MAP = [
  { match: (rel) => rel === 'index.html', priority: '1.0', changefreq: 'weekly' },
  { match: (rel) => rel.startsWith('insights/blogs/') && rel !== 'insights/blogs.html', priority: '0.5', changefreq: 'weekly' },
  { match: (rel) => rel === 'insights/blogs.html', priority: '0.6', changefreq: 'monthly' },
  { match: (rel) => rel.startsWith('insights/') && !rel.startsWith('insights/blogs/') && !rel.startsWith('insights/case-studies/'), priority: '0.6', changefreq: 'monthly' },
  { match: (rel) => rel.startsWith('solutions/'), priority: '0.8', changefreq: 'yearly' },
  { match: (rel) => rel.startsWith('platforms/'), priority: '0.8', changefreq: 'yearly' },
  { match: (rel) => rel.startsWith('industries/'), priority: '0.7', changefreq: 'yearly' },
  { match: (rel) => rel.startsWith('company/'), priority: '0.6', changefreq: 'yearly' },
  { match: (rel) => rel.startsWith('insights/case-studies/'), priority: '0.6', changefreq: 'yearly' },
  { match: (rel) => rel === 'contact.html' || rel === 'contact/index.html', priority: '0.6', changefreq: 'yearly' },
  { match: (rel) => rel.startsWith('careers/'), priority: '0.6', changefreq: 'yearly' },
  { match: (rel) => rel.startsWith('legal/'), priority: '0.3', changefreq: 'yearly' },
  { match: () => true, priority: '0.5', changefreq: 'yearly' }, // catch-all
];

// Folders to always exclude
const EXCLUDED_FOLDERS = [
  'node_modules', '.github', '.git', 'components', 'assets', 'css', 'js',
  'admin', 'test', 'temp', 'gcc',
];

// Files to always exclude
const EXCLUDED_FILES = [
  '404.html', 'generate-sitemap.js',
];

// Filename patterns to exclude
const EXCLUDED_PATTERNS = ['_draft', '_wip', '_old'];

// Section labels for summary
function getSection(rel) {
  if (rel === 'index.html') return 'Homepage';
  if (rel.startsWith('solutions/case-studies/')) return 'Case Studies';
  if (rel.startsWith('solutions/')) return 'Solutions';
  if (rel.startsWith('platforms/')) return 'Platforms';
  if (rel.startsWith('industries/')) return 'Industries';
  if (rel.startsWith('company/')) return 'Company';
  if (rel.startsWith('insights/blogs/') || rel === 'insights/blogs.html') return 'Blog posts';
  if (rel.startsWith('insights/case-studies/')) return 'Case Studies';
  if (rel.startsWith('insights/')) return 'Resources';
  if (rel.startsWith('careers/')) return 'Careers';
  if (rel.startsWith('legal/')) return 'Legal';
  if (rel === 'contact.html') return 'Contact';
  return 'Other';
}

function getChangefreqLabel(section) {
  if (section === 'Homepage') return 'weekly';
  if (section === 'Blog posts') return 'weekly';
  if (section === 'Resources') return 'monthly';
  return 'yearly';
}

// Recursively find all HTML files
function findHtmlFiles(dir, relBase) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(relBase, entry.name).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (EXCLUDED_FOLDERS.includes(entry.name)) continue;
      results.push(...findHtmlFiles(fullPath, relPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push({ fullPath, relPath });
    }
  }
  return results;
}

// Convert file path to URL
function fileToUrl(relPath) {
  // index.html at root → /
  if (relPath === 'index.html') return BASE_URL + '/';
  // Remove .html extension for clean URLs
  let url = relPath.replace(/\.html$/, '');
  // Remove /index from paths like folder/index
  url = url.replace(/\/index$/, '');
  return BASE_URL + '/' + url;
}

// Get priority and changefreq
function getPriorityConfig(relPath) {
  for (const rule of PRIORITY_MAP) {
    if (rule.match(relPath)) {
      return { priority: rule.priority, changefreq: rule.changefreq };
    }
  }
  return { priority: '0.5', changefreq: 'yearly' };
}

// Main
console.log('Parkar Sitemap Generator');
console.log('------------------------');
console.log('Scanning project directory...\n');

const allFiles = findHtmlFiles(ROOT, '');
console.log(`Total HTML files found: ${allFiles.length}\n`);

const skipped = [];
const included = [];

for (const file of allFiles) {
  const { fullPath, relPath } = file;
  const fileName = path.basename(relPath);

  // Check excluded files
  if (EXCLUDED_FILES.includes(fileName)) {
    skipped.push({ path: relPath, reason: 'excluded file' });
    continue;
  }

  // Check excluded patterns
  const hasPattern = EXCLUDED_PATTERNS.some(p => fileName.includes(p));
  if (hasPattern) {
    skipped.push({ path: relPath, reason: 'draft/wip/old file' });
    continue;
  }

  // Check manual exclude
  if (MANUAL_EXCLUDE.includes(relPath)) {
    skipped.push({ path: relPath, reason: 'manual exclude' });
    continue;
  }

  // Read file content for content checks
  let content;
  try {
    content = fs.readFileSync(fullPath, 'utf-8');
  } catch (e) {
    skipped.push({ path: relPath, reason: 'unreadable file' });
    continue;
  }

  // Check file size
  const size = Buffer.byteLength(content, 'utf-8');
  if (size < 500) {
    skipped.push({ path: relPath, reason: `empty file — ${size} bytes` });
    continue;
  }

  // Check content for "coming soon"
  const lower = content.toLowerCase();
  if (lower.includes('coming soon')) {
    skipped.push({ path: relPath, reason: 'coming soon page' });
    continue;
  }

  // Check for "under construction"
  if (lower.includes('under construction')) {
    skipped.push({ path: relPath, reason: 'under construction' });
    continue;
  }

  // Check for "placeholder" — but skip if it's in a CSS class name or filename reference
  // Only flag if "placeholder" appears in visible text content (not in src/class attributes)
  const strippedHtml = content.replace(/<[^>]+>/g, ' ');
  if (strippedHtml.toLowerCase().includes('placeholder') && !relPath.includes('placeholder')) {
    // Double check — skip false positives from "navbar-placeholder" or "footer-placeholder"
    const visiblePlaceholder = strippedHtml.toLowerCase().replace(/navbar-placeholder|footer-placeholder|placeholder\.(png|jpg|svg|webp)/g, '');
    if (visiblePlaceholder.includes('placeholder')) {
      skipped.push({ path: relPath, reason: 'placeholder content' });
      continue;
    }
  }

  // Check for noindex
  if (content.includes('<meta name="robots" content="noindex">') || content.includes('<meta name="robots" content="noindex"')) {
    skipped.push({ path: relPath, reason: 'noindex tag present' });
    continue;
  }

  // Passed all checks — include
  const url = fileToUrl(relPath);
  const config = getPriorityConfig(relPath);
  const section = getSection(relPath);

  included.push({
    url,
    relPath,
    priority: config.priority,
    changefreq: config.changefreq,
    section,
  });
}

// Print skipped files
if (skipped.length > 0) {
  for (const s of skipped) {
    console.log(`Skipped (${s.reason}): ${s.path}`);
  }
  console.log('');
}

// Sort: highest priority first, then alphabetically
included.sort((a, b) => {
  const pDiff = parseFloat(b.priority) - parseFloat(a.priority);
  if (pDiff !== 0) return pDiff;
  return a.url.localeCompare(b.url);
});

// Build sitemap XML
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

for (const entry of included) {
  xml += '  <url>\n';
  xml += `    <loc>${entry.url}</loc>\n`;
  xml += `    <lastmod>${TODAY}</lastmod>\n`;
  xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
  xml += `    <priority>${entry.priority}</priority>\n`;
  xml += '  </url>\n';
}

xml += '</urlset>\n';

// Write sitemap.xml
const sitemapPath = path.join(ROOT, 'sitemap.xml');
fs.writeFileSync(sitemapPath, xml, 'utf-8');

// Update robots.txt
const robotsPath = path.join(ROOT, 'robots.txt');
const sitemapLine = `Sitemap: ${BASE_URL}/sitemap.xml`;
let robotsContent;

if (fs.existsSync(robotsPath)) {
  robotsContent = fs.readFileSync(robotsPath, 'utf-8');
  if (!robotsContent.includes('Sitemap:')) {
    robotsContent = robotsContent.trimEnd() + '\n\n' + sitemapLine + '\n';
  }
} else {
  robotsContent = `User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /\n\nUser-agent: ClaudeBot\nDisallow: /\n\n${sitemapLine}\n`;
}

fs.writeFileSync(robotsPath, robotsContent, 'utf-8');

// Summary
console.log(`URLs written to sitemap.xml: ${included.length}`);
console.log(`Files skipped: ${skipped.length}\n`);

// Breakdown by section
const sectionCounts = {};
for (const entry of included) {
  if (!sectionCounts[entry.section]) {
    sectionCounts[entry.section] = 0;
  }
  sectionCounts[entry.section]++;
}

console.log('Breakdown by section:');
const sectionOrder = ['Homepage', 'Solutions', 'Platforms', 'Industries', 'Company', 'Careers', 'Case Studies', 'Resources', 'Blog posts', 'Contact', 'Legal', 'Other'];
for (const section of sectionOrder) {
  const count = sectionCounts[section];
  if (count) {
    const label = getChangefreqLabel(section);
    console.log(`  ${(section + ':').padEnd(17)} ${String(count).padStart(3)} URL${count === 1 ? ' ' : 's'} — ${label}`);
  }
}

console.log('');
console.log(`sitemap.xml written to: ${sitemapPath}`);
console.log(`robots.txt updated at:  ${robotsPath}`);
console.log('\nDone. Remember to run this script before every deployment.');
