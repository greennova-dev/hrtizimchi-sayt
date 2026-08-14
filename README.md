# hrtizimchi.uz — Tizimchi HR marketing sayti

[Tizimchi HR](https://t.me/tizimchi_hr_bot) — Telegram Mini App orqali GPS-davomat,
ish haqi va hisobot platformasi. Bu repo faqat **marketing saytini** saqlaydi;
mahsulotning o'zi alohida (private) repoda.

## Nima bu

Statik sahifa: `index.html` + `demo.js`. Build qadami, paket menejeri,
framework va tashqi CDN ishlatilmaydi. Sahifa ochilishi bilan
ishlaydi, JavaScript o'chirilgan brauzerda ham o'zbekcha matn to'liq o'qiladi.

```
hrtizimchi-sayt/
├── index.html            sayt: HTML + CSS + i18n lug'ati
├── demo.js               jonli demo (Mini App nusxasi) + `window.TizimchiDemo`
├── og.jpg                Telegram/ijtimoiy tarmoq oldindan ko'rish rasmi
├── og-source.svg         o'sha rasmning vektor manbasi
├── apple-touch-icon.png  iPhone "bosh ekranga qo'shish" ikonkasi
├── icon-512.png          zaxira ikonka (512×512)
├── robots.txt · sitemap.xml
└── .github/workflows/deploy.yml   main'ga push → serverda git pull
```

## Animatsiyalar

To'rt qatlam, hammasi `prefers-reduced-motion: reduce` da butunlay o'chadi:

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

   **Qoida:** bitta elementda ikkita `transform` e'loni yashay olmaydi.
   Shuning uchun tarif kartasining ko'tarilishi ham, qiyshayishi ham
   BITTA e'londa (`--lift`, `--rx`, `--ry`), va u selektor kuchi bo'yicha
   `.rv.in{transform:none}` dan ustun turishi kerak — aks holda karta
   ochilgandan keyin qiyshayish umuman ishlamaydi.

## Ikki til

O'zbekcha matn **HTML ning o'zida** turadi, ruschasi esa sahifa oxiridagi
`RU` lug'atida. Sabab: qidiruv tizimi va JavaScriptsiz brauzer asosiy tilni
baribir ko'radi, rus tili esa tugma bosilganda almashadi.

Har bir tarjima qilinadigan element `data-i18n="kalit"` oladi. Sahifa
yuklanganda o'zbekcha matn `UZ` obyektiga yig'iladi, shuning uchun o'zbekcha
lug'atni qo'lda yozish shart emas — HTML ning o'zi manba.

**Matn qo'shganda:** elementga `data-i18n` bering va `RU` lug'atiga o'sha
kalitni qo'shing. Tekshirish:

```bash
node -e "
const h=require('fs').readFileSync('index.html','utf8');
const k=[...new Set([...h.matchAll(/data-i18n=\"([^\"]+)\"/g)].map(m=>m[1]))];
const d=h.slice(h.indexOf('var RU = {'),h.indexOf('};',h.indexOf('var RU = {')));
const s=new Set([...d.matchAll(/'([a-z0-9.]+)'\s*:/g)].map(m=>m[1]));
const miss=k.filter(x=>!s.has(x));
console.log(miss.length?'RU da yetishmaydi: '+miss.join(', '):'✓ '+k.length+' kalit to\'liq');
"
```

Til tanlovi `localStorage` da saqlanadi. Birinchi tashrifda brauzer tili rus
bo'lsa ruscha ochiladi, aks holda o'zbekcha.

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
