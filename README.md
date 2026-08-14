# hrtizimchi.uz — Tizimchi HR marketing sayti

[Tizimchi HR](https://t.me/tizimchi_hr_bot) — Telegram Mini App orqali GPS-davomat,
ish haqi va hisobot platformasi. Bu repo faqat **marketing saytini** saqlaydi;
mahsulotning o'zi alohida (private) repoda.

## Nima bu

Statik sahifa: `index.html` + `demo.js`. Paket menejeri, framework va
tashqi CDN ishlatilmaydi; yagona yasash qadami — bitta Node skripti
(`build.mjs`), u ham chiqishda oddiy statik HTML qoldiradi. Sahifa
ochilishi bilan ishlaydi, JavaScript o'chirilgan brauzerda ham matn
to'liq o'qiladi.

```
hrtizimchi-sayt/
├── index.html            sayt: HTML + CSS + ruscha lug'at (MANBA)
├── ru/index.html         ruscha sahifa — YASALADI, qo'lda tegilmaydi
├── build.mjs             /ru/, sitemap va JSON-LD ni yasaydi (0 paket)
├── demo.js               jonli demo (Mini App nusxasi) + `window.TizimchiDemo`
├── og.jpg                Telegram/ijtimoiy tarmoq oldindan ko'rish rasmi
├── og-source.svg         o'sha rasmning vektor manbasi
├── apple-touch-icon.png  iPhone "bosh ekranga qo'shish" ikonkasi
├── robots.txt · sitemap.xml
└── .github/workflows/
    ├── deploy.yml     main'ga push → serverda git pull
    └── check.yml      yasalgan fayllar yangimi + tarjima to'liqmi
```

## Animatsiyalar

Yetti qatlam, hammasi `prefers-reduced-motion: reduce` da butunlay o'chadi:

1. **Ochilish xoreografiyasi** — hero bo'laklari yuklanishda navbat bilan
   ko'tariladi (`heroIn`), qolgan bloklar esa ko'rinishga kirganda
   (`.rv` → `.in`) xiralikdan aniqlikka o'tadi. Navbat `--i` o'zgaruvchisi
   orqali: JS faqat qatordagi o'rinni yozadi, vaqtni CSS hisoblaydi.
2. **Surilish bo'yicha animatsiya** — yuqoridagi o'lchagich chizig'i va
   hero telefonining uzoqlashishi `animation-timeline` bilan ishlaydi,
   ya'ni `scroll` hodisasiga obuna yo'q. `@supports` bloki ichida, shuning
   uchun eski brauzerda shunchaki ishlamaydi va hech narsa buzilmaydi.
3. **«Qanday ishlaydi» — yopishib turuvchi telefon.** Keng ekranda (≥1081px)
   telefon `position:sticky` bilan ushlanadi, qadam matni yonidan suriladi
   va har qadamda telefonda mos ekran ochiladi (`home` → `branches` →
   `employees` → `attendance`). Ekranni `demo.js` dagi
   `window.TizimchiDemo.screen(key)` chizadi.

   Bu ko'rinishni JS `.how--live` sinfi bilan **yoqadi**. Ya'ni JS ishlamasa
   yoki demo yuklanmasa bo'lim oddiy to'rt ustunli grid bo'lib qolaveradi —
   bo'sh telefon ramkasi hech qachon ko'rinmaydi. Til almashganda ikkinchi
   telefon `tizimchi-demo-lang` hodisasi orqali qayta chiziladi (`setTimeout`
   bilan kutish skript yuklanish tartibiga bog'liq bo'lib qolardi).
4. **Kartalar va detallar** — kursor ortidan yuruvchi yorug'lik (`.spot`
   sinfini JS qo'yadi; bitta hujjat darajasidagi tinglovchi + rAF), tarif
   kartalarining yengil qiyshayishi, narx almashuvi va «Nega biz»
   bo'limidagi SVG rasmlarning jonlanishi (`.diff.in .dv-*`). Sahifa
   ortida esa juda sekin suzuvchi shimoliy shafaq (`.aurora`) — telefonda
   harakati o'chirilgan, faqat statik dog'lar qoladi.

5. **Ekran almashuvi (View Transitions)** — til va mavzu almashganda
   brauzer eski/yangi holatning suratini olib, oralig'ini o'zi chizadi.
   Mavzu tugmadan doira bo'lib tarqaladi (doirani JS chizadi, chunki
   markaz tugmaning joriy o'rniga bog'liq; **foizda**, chunki
   `::view-transition-new(root)` ning koordinatasi qurilma piksellari
   zichligiga bog'liq bo'lib chiqdi). Oferta sahifasiga o'tish ham
   silliq — `@view-transition{navigation:auto}` **ikkala** hujjatda ham
   e'lon qilingan, bir tomon jim tursa o'tish boshlanmaydi.

   Til almashuvi ishlashi uchun `apply()` oxirida `tizimchi-lang`
   hodisasi yuboriladi va demo telefonlar o'shanga ulanadi: shunda
   hamma o'zgarish bitta qadamda bo'ladi va surat yaxlit chiqadi.

6. **Navigatsiyada joriy bo'lim** — yugurib yuruvchi kapsula
   (`.nav-pill`). O'lchamni JS yozadi (`--px/--pw`), chunki havola matni
   tilga qarab o'zgaradi. Ekranning yuqori uchdan biridagi bo'lim
   tanlanadi; bir nechtasi bo'lsa eng yuqoridagisi, hech biri bo'lmasa
   kapsula ko'rinmaydi.

7. **Tugma bosilganda to'lqin** — `.btn::before` (`::after` da
   allaqachon yorug'lik yugurib o'tadi), rang `currentColor` dan.

   **Qoida:** bitta elementda ikkita `transform` e'loni yashay olmaydi.
   Shuning uchun tarif kartasining ko'tarilishi ham, qiyshayishi ham
   BITTA e'londa (`--lift`, `--rx`, `--ry`), va u selektor kuchi bo'yicha
   `.rv.in{transform:none}` dan ustun turishi kerak — aks holda karta
   ochilgandan keyin qiyshayish umuman ishlamaydi.

## Yasash

```bash
node build.mjs      # ru/index.html + sitemap.xml + JSON-LD
```

Paket ham, framework ham yo'q — bitta Node skripti. U uch ish qiladi:
`index.html` dan **ruscha sahifani** yasaydi (matnni `OTHER` lug'atidan
oladi, `<head>` ni ruschaga o'giradi, `BASE_LANG` ni almashtiradi),
`sitemap.xml` ni yangilaydi va ikkala sahifaga **JSON-LD sxemasini**
yozadi (savol-javoblar sahifaning o'zidan olinadi, shuning uchun sxema
ko'rinadigan matndan ajralib ketmaydi).

⚠️ `index.html` ni tahrirlagach `node build.mjs` ni ishga tushiring.
Unutilsa CI ushlaydi (`.github/workflows/check.yml`) — u yasalgan
fayllarni qayta yasab, farq bor-yo'qligini tekshiradi.

## Ikki til

O'zbekcha matn **HTML ning o'zida** turadi, ruschasi esa sahifa oxiridagi
`OTHER` lug'atida. Har til **o'z manzilida**: `/` va `/ru/` — ilgari
ruscha matn faqat tugma bosilganda paydo bo'lardi va qidiruv tizimi uni
umuman ko'rmasdi. Sahifada `hreflang` juftligi bor, tugma esa matnni
joyida almashtiradi va `history.replaceState` bilan manzilni ham
to'g'rilaydi.

**Manzil saqlangan tanlovdan ustun:** `/ru/` ni ochgan odam tilni aniq
aytdi, shuning uchun u yerda `localStorage` dagi eski tanlov qo'llanmaydi.

Har bir tarjima qilinadigan element `data-i18n="kalit"` oladi. Sahifa
yuklanganda uning O'Z matni `SELF` obyektiga yig'iladi, ya'ni sahifaning
o'z tilidagi lug'atni qo'lda yozish shart emas — HTML ning o'zi manba.
`OTHER` esa ikkinchi til; `/ru/` sahifasida u o'zbekchaga aylanadi
(buni `build.mjs` qiladi).

**Matn qo'shganda:** elementga `data-i18n` bering, `OTHER` lug'atiga o'sha
kalitni qo'shing va `node build.mjs` ni ishga tushiring. Tekshirish:

```bash
node -e "
const h=require('fs').readFileSync('index.html','utf8');
const k=[...new Set([...h.matchAll(/data-i18n=\"([^\"]+)\"/g)].map(m=>m[1]))];
const d=h.slice(h.indexOf('var OTHER = {'),h.indexOf('};',h.indexOf('var OTHER = {')));
const s=new Set([...d.matchAll(/'([a-z0-9.]+)'\s*:/g)].map(m=>m[1]));
const miss=k.filter(x=>!s.has(x));
console.log(miss.length?'RU da yetishmaydi: '+miss.join(', '):'✓ '+k.length+' kalit to\'liq');
"
```

Til tanlovi `localStorage` da saqlanadi va **faqat bosh manzilda** (`/`)
qo'llanadi. Birinchi tashrifda brauzer tili rus bo'lsa ruscha ochiladi.

## Narxlar

Saytdagi narxlar mahsulot bazasidagi tariflarga **qo'lda** moslashtiriladi —
sayt API'ga bormaydi (statik bo'lib qolishi uchun). Tarif o'zgarsa,
`#tariflar` bo'limidagi to'rt kartani va yillik tejamkorlik summasini
qo'lda yangilash kerak.

Joriy holat (2026-08-09): Kichik 199 000 · O'rta 299 000 · Katta 499 000 ·
Cheksiz 999 000 so'm/oy; yillik narxlar −17% dan −33% gacha chegirma bilan.

## Oldindan ko'rish rasmi (og.jpg)

Havola Telegramga tashlanganda chiqadigan rasm. Manba — `og-source.svg`
(vektor, 1200×630). Matn o'zgarsa shu faylni tahrirlab, rasmni qayta yasang:

```bash
# QuickLook SVG ni kvadratga sig'diradi, shuning uchun avval o'raymiz, keyin kesamiz
python3 - <<'PY'
import pathlib
s = pathlib.Path('og-source.svg').read_text()
inner = s.replace('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"',
                  '<svg x="0" y="285" width="1200" height="630"', 1)
pathlib.Path('/tmp/og-wrap.svg').write_text(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">'
  '<rect width="1200" height="1200" fill="#eef3fb"/>' + inner + '</svg>')
PY
rm -rf /tmp/ogout && mkdir /tmp/ogout
qlmanage -t -s 1200 -o /tmp/ogout /tmp/og-wrap.svg >/dev/null 2>&1
sips --cropToHeightWidth 630 1200 /tmp/ogout/og-wrap.svg.png --out /tmp/og.png >/dev/null
sips -s format jpeg -s formatOptions 88 /tmp/og.png --out og.jpg >/dev/null
sips -g pixelWidth -g pixelHeight og.jpg   # 1200 × 630 bo'lishi kerak
```

`og:image` **mutlaq manzil** bo'lishi shart, shuning uchun `index.html` da
`https://hrtizimchi.uz/og.jpg` yozilgan — domen ishga tushmaguncha Telegram
rasmni topa olmaydi.

## Lokal ko'rish

```bash
python3 -m http.server 4599
# http://localhost:4599
```

## Deploy

`main` ga push qilinsa GitHub Actions serverga SSH orqali kiradi va
`git pull` qiladi. Kerakli secretlar: `SERVER_HOST`, `SERVER_USER`,
`SERVER_SSH_KEY`. Serverda sayt `/var/www/hrtizimchi` da, nginx orqali
`hrtizimchi.uz` domenida beriladi.
