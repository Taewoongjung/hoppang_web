const fs = require('fs');
const path = require('path');

const domain = 'https://hoppang.store';
const currentDate = new Date().toISOString();

// 공개 페이지 목록 (로그인이 필요 없는 페이지)
const publicPages = [
  '/chassis/calculator',
  '/calculator/simple/step0',
  '/calculator/simple/step1',
  '/calculator/simple/step2',
  '/calculator/simple/step3',
  '/calculator/simple/step4',
  '/calculator/simple/step5',
  '/v2/guide/howtochoosechassistype',
  '/v2/guide/hoppangprocess',
  '/v2/guide/chassisperformance',
  '/question/boards',
  '/policy/privacy',
  '/policy/termofuse',
];

function generateSitemap() {
  const urls = publicPages.map(page => {
    return `  <url>
    <loc>${domain}${page}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls}
</urlset>`;

  // build 폴더에 sitemap 저장
  const buildSitemapPath = path.join(__dirname, '..', 'build', 'sitemap.xml');
  fs.writeFileSync(buildSitemapPath, sitemap, 'utf8');

  // public 폴더에도 sitemap 저장 (개발용)
  const publicSitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(publicSitemapPath, sitemap, 'utf8');

  console.log('✅ Sitemap generated successfully!');
  console.log(`   Total pages: ${publicPages.length}`);
}

generateSitemap();
