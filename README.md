# hrtizimchi.uz — Tizimchi HR marketing sayti

[Tizimchi HR](https://t.me/tizimchi_hr_bot) — Telegram Mini App orqali GPS-davomat,
ish haqi va hisobot platformasi. Bu repo faqat **marketing saytini** saqlaydi;
mahsulotning o'zi alohida (private) repoda.

## Nima bu

Bitta statik sahifa: `index.html`. Boshqa hech narsa yo'q — build qadami,
paket menejeri, framework, tashqi CDN ishlatilmaydi. Sahifa ochilishi bilan
ishlaydi, JavaScript o'chirilgan brauzerda ham o'zbekcha matn to'liq o'qiladi.

```
hrtizimchi-sayt/
├── index.html      butun sayt: HTML + CSS + i18n lug'ati
└── .github/workflows/deploy.yml   main'ga push → serverda git pull
```

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
