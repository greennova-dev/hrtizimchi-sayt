#!/usr/bin/env node
/* build.mjs — `index.html` dan ruscha sahifani va JSON-LD sxemasini yasaydi.
 *
 * Nega kerak: ruscha matn ilgari faqat `OTHER` lug'atida turardi va
 * tugma bosilgandagina paydo bo'lardi. Qidiruv tizimi esa sahifani
 * bosmaydi — u faqat serverdan kelgan HTML ni ko'radi, ya'ni butun
 * ruscha mazmun indeksga umuman tushmasdi.
 *
 * Nima yasaydi:
 *   ru/index.html   — o'sha sahifa, lekin matni ruscha va `lang="ru"`
 *   sitemap.xml     — ikkala til
 *   index.html      — ichidagi JSON-LD bloki yangilanadi (joyida)
 *
 * Nega framework yo'q: chiqishi baribir oddiy statik HTML. Bitta fayl,
 * nol paket, `node build.mjs` — shu.
 *
 * DIQQAT: `ru/index.html` QO'LDA tahrirlanmaydi, u har safar qaytadan
 * yasaladi. Matn `index.html` da (o'zbekchasi) va `OTHER` lug'atida
 * (ruschasi) turadi.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SRC = path.join(ROOT, 'index.html');
const SITE = 'https://hrtizimchi.uz';

const src = fs.readFileSync(SRC, 'utf8');

/* ---------- 1. Ikkinchi til lug'atini o'qiymiz ----------
   Obyekt JS literali, shuning uchun uni o'qishning eng ishonchli yo'li —
   JS ning o'ziga baholatish. Fayl bizniki, tashqaridan kelmaydi. */
function readDict(html) {
  const at = html.indexOf('var OTHER = {');
  if (at < 0) throw new Error('`var OTHER = {` topilmadi — index.html o\'zgarganmi?');
  const open = html.indexOf('{', at);
  const close = html.indexOf('\n};', open);
  if (close < 0) throw new Error('`OTHER` lug\'atining yopilishi topilmadi');
  return new Function('return ' + html.slice(open, close + 2))();
}

/* ---------- 2. Sahifadagi o'z matni ----------
   `data-i18n` li elementlar ICHMA-ICH joylashmagani tekshirilgan, shuning
   uchun eng yaqin yopiluvchi tegkacha olish xavfsiz. Aks holda bu yerda
   to'liq HTML tahlilchisi kerak bo'lardi. */
const EL = /<(\w+)((?:[^>]*?)\sdata-i18n="([^"]+)"(?:[^>]*?))>([\s\S]*?)<\/\1>/g;

function readSelf(html) {
  const out = {};
  for (const m of html.matchAll(EL)) out[m[3]] = m[4];
  return out;
}

const OTHER = readDict(src);
const SELF = readSelf(src);

/* ---------- 3. Tekshiruv ----------
   Tarjimasiz kalit bo'lsa sahifa yarim o'zbekcha chiqadi — bu jimgina
   o'tib ketmasligi kerak. */
const missing = Object.keys(SELF).filter((k) => OTHER[k] === undefined);
if (missing.length) {
  console.error('✗ Tarjimasi yo\'q kalitlar: ' + missing.join(', '));
  process.exit(1);
}
for (const k of ['meta.title', 'meta.desc', 'meta.ogdesc']) {
  if (!OTHER[k]) { console.error('✗ `' + k + '` kaliti kerak'); process.exit(1); }
}

/* ---------- 4. JSON-LD sxemasi ----------
   Savol-javoblar sahifaning O'ZIDAN olinadi, shuning uchun sxema va
   ko'rinadigan matn hech qachon bir-biridan ajralib ketmaydi. */
function schema(lang, dict) {
  const t = (k) => dict[k] || SELF[k];
  const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/&apos;/g, "'").replace(/&amp;/g, '&').trim();
  const url = lang === 'ru' ? SITE + '/ru/' : SITE + '/';

  const faq = [];
  for (let i = 1; i <= 9; i++) {
    const q = t('q.' + i + 'q'), a = t('q.' + i + 'a');
    if (!q || !a) break;
    faq.push({
      '@type': 'Question',
      name: strip(q),
      acceptedAnswer: { '@type': 'Answer', text: strip(a) }
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': SITE + '/#org',
        name: 'Tizimchi HR',
        url: SITE + '/',
        logo: SITE + '/apple-touch-icon.png',
        sameAs: ['https://t.me/tizimchi_hr_bot'],
        parentOrganization: { '@type': 'Organization', name: 'GreenNova' }
      },
      {
        '@type': 'WebSite',
        '@id': url + '#site',
        url,
        name: 'Tizimchi HR',
        inLanguage: lang,
        publisher: { '@id': SITE + '/#org' }
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Tizimchi HR',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Telegram (iOS, Android, Web)',
        url: SITE + '/',
        inLanguage: ['uz', 'ru'],
        description: strip(lang === 'ru' ? OTHER['meta.desc'] : META_UZ.desc),
        provider: { '@id': SITE + '/#org' },
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'UZS',
          lowPrice: '199000',
          highPrice: '999000',
          offerCount: 4,
          url: SITE + '/#tariflar'
        }
      },
      { '@type': 'FAQPage', '@id': url + '#faq', inLanguage: lang, mainEntity: faq }
    ]
  };
}

/* O'zbekcha <head> matnlari — sxema uchun kerak */
const META_UZ = {
  title: (src.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '',
  desc: (src.match(/<meta name="description" content="([^"]*)"/) || [])[1] || ''
};

/* Sxema blokini joyiga qo'yamiz. Blok bor bo'lsa — ichi yangilanadi,
   yo'q bo'lsa — `</head>` dan oldin qo'shiladi. Shu sababli skriptni
   necha marta ishga tushirsangiz ham natija bir xil. */
const SCHEMA_RE = /<script type="application\/ld\+json" id="schema">[\s\S]*?<\/script>/;
function withSchema(html, lang, dict) {
  const block = '<script type="application/ld+json" id="schema">\n' +
    JSON.stringify(schema(lang, dict), null, 1) + '\n</script>';
  if (SCHEMA_RE.test(html)) return html.replace(SCHEMA_RE, block);
  return html.replace('</head>',
    '<!-- Qidiruv tizimi uchun. Bu blokni `build.mjs` yozadi — qo\'lda tegmang. -->\n' +
    block + '\n</head>');
}

/* ---------- 5. Kesh uchun versiya belgisi ----------
   `demo.js` nomi o'zgarmaydi, shuning uchun uni uzoq keshlab bo'lmasdi:
   yangi versiya chiqsa ham brauzer eskisini ko'rsatib turardi. Manzilga
   fayl mazmunining qisqa xesh'ini qo'shsak, har o'zgarishda manzil
   yangi bo'ladi va nginx faylni bir yilga keshlashi mumkin.
   Amal idempotent — skriptni qayta ishga tushirsangiz xesh almashadi,
   ikkilanmaydi. */
const demoHash = crypto.createHash('sha1')
  .update(fs.readFileSync(path.join(ROOT, 'demo.js')))
  .digest('hex').slice(0, 10);

/* ---------- 6. O'zbekcha sahifa: sxema va versiya belgisi ---------- */
let uz = withSchema(src, 'uz', SELF);
uz = uz.replace(/src="\/demo\.js(?:\?v=[a-f0-9]+)?"/, 'src="/demo.js?v=' + demoHash + '"');
if (uz !== src) fs.writeFileSync(SRC, uz);

/* ---------- 7. Ruscha sahifa ---------- */
let ru = uz;

/* Matn */
ru = ru.replace(EL, (whole, tag, attrs, key, inner) =>
  OTHER[key] === undefined ? whole : '<' + tag + attrs + '>' + OTHER[key] + '</' + tag + '>');

/* Bosh qism */
ru = ru
  .replace('<html lang="uz">', '<html lang="ru">')
  .replace(/<title>[\s\S]*?<\/title>/, '<title>' + OTHER['meta.title'] + '</title>')
  .replace(/(<meta name="description" content=")[^"]*(")/, '$1' + OTHER['meta.desc'] + '$2')
  .replace(/(<meta property="og:title" content=")[^"]*(")/, '$1' + OTHER['meta.title'] + '$2')
  .replace(/(<meta property="og:description" content=")[^"]*(")/, '$1' + OTHER['meta.ogdesc'] + '$2')
  .replace(/(<meta property="og:image:alt" content=")[^"]*(")/, '$1' + OTHER['meta.title'] + '$2')
  .replace('<meta property="og:url" content="' + SITE + '/">',
           '<meta property="og:url" content="' + SITE + '/ru/">')
  .replace('<meta property="og:locale" content="uz_UZ">',
           '<meta property="og:locale" content="ru_RU">')
  .replace('<meta property="og:locale:alternate" content="ru_RU">',
           '<meta property="og:locale:alternate" content="uz_UZ">')
  .replace('<link rel="canonical" href="' + SITE + '/">',
           '<link rel="canonical" href="' + SITE + '/ru/">');

/* Til va ikkinchi lug'at almashadi: bu sahifada "boshqa til" — o'zbekcha */
ru = ru
  .replace("var BASE_LANG = 'uz'; /* BUILD:base */", "var BASE_LANG = 'ru'; /* BUILD:base */")
  .replace(/var OTHER = \{ \/\* BUILD:other \*\/[\s\S]*?\n\};/,
           'var OTHER = ' + JSON.stringify(
             Object.assign({}, SELF, {
               'meta.title': META_UZ.title,
               'meta.desc': META_UZ.desc
             }), null, 1) + ';');

/* Sxema — ruscha */
ru = withSchema(ru, 'ru', OTHER);

/* Yasalgan fayl ekanini eslatib qo'yamiz */
ru = ru.replace('<!doctype html>',
  '<!doctype html>\n<!-- YASALGAN FAYL — qo\'lda tahrirlamang.\n' +
  '     Manba: /index.html + `OTHER` lug\'ati · qayta yasash: node build.mjs -->');

fs.mkdirSync(path.join(ROOT, 'ru'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'ru', 'index.html'), ru);

/* ---------- 8. Tekshiruv: har bir element haqiqatan almashdimi ----------
   Faylning o'zida qidirib bo'lmaydi — ruscha sahifa ichida o'zbekcha
   lug'at yotadi (tugma bosilganda kerak bo'ladi), ya'ni o'zbekcha matn
   u yerda BOR va bo'lishi ham kerak. Shuning uchun sahifani qaytadan
   o'qib, elementlarning ichi ruschaga aylanganini tekshiramiz. */
const check = readSelf(ru);
const bad = Object.keys(SELF).filter((k) => check[k] !== OTHER[k]);
if (bad.length) {
  console.error('✗ /ru/ da almashmagan elementlar: ' + bad.slice(0, 12).join(', ') +
    (bad.length > 12 ? ' … jami ' + bad.length : ''));
  process.exit(1);
}

/* ---------- 9. sitemap ---------- */
const pages = [
  { loc: SITE + '/', freq: 'monthly', pri: '1.0', alt: true },
  { loc: SITE + '/ru/', freq: 'monthly', pri: '0.9', alt: true },
  { loc: SITE + '/oferta.html', freq: 'yearly', pri: '0.3', alt: false }
];
const alts =
  '\n      <xhtml:link rel="alternate" hreflang="uz" href="' + SITE + '/"/>' +
  '\n      <xhtml:link rel="alternate" hreflang="ru" href="' + SITE + '/ru/"/>' +
  '\n      <xhtml:link rel="alternate" hreflang="x-default" href="' + SITE + '/"/>';

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
  '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
  pages.map((p) =>
    '  <url>\n' +
    '    <loc>' + p.loc + '</loc>' + (p.alt ? alts : '') + '\n' +
    '    <changefreq>' + p.freq + '</changefreq>\n' +
    '    <priority>' + p.pri + '</priority>\n' +
    '  </url>'
  ).join('\n') + '\n</urlset>\n');

console.log('✓ ru/index.html · sitemap.xml · JSON-LD (' + Object.keys(SELF).length + ' kalit, ' +
  (schema('uz', SELF)['@graph'][3].mainEntity.length) + ' savol)');
