/**
 * Narxlar hamma joyda bir xilmi?
 *
 * Narx uchta joyda ko'rinadi va ular uchalasi ham qo'lda yozilgan edi:
 *   1. saytdagi tarif KARTOCHKALARI (`.amt` ichidagi `.cy-m` / `.cy-y`)
 *   2. saytdagi tarif TANLAGICHI (`PLANS` massivi, "2 savolda aniqlaymiz")
 *   3. bazadagi tarif — mijoz aynan shuncha to'laydi
 *
 * Birortasi unutilsa mijoz bir joyda bir raqamni, boshqa joyda boshqasini
 * ko'radi. Eng yomoni uchinchisi: kartochkada 199 000 yozilib, hisobda
 * boshqa summa chiqsa — bu chalkashlik emas, va'daning buzilishi.
 *
 * Ishlatish:
 *   node tools/narx-tekshir.mjs           # sayt ichini + jonli bazani
 *   node tools/narx-tekshir.mjs --offline # faqat sayt ichini
 *
 * Jonli baza bilan solishtirish tarmoqqa bog'liq, shuning uchun u
 * YIQITMAYDI: manzilga yetib bo'lmasa ogohlantirish bilan o'tkazib
 * yuboriladi. Aks holda CI internet uzilganda qizarib turaverardi.
 */
import { readFileSync } from 'node:fs'

const TARIF_API = process.env.TARIF_API ?? 'https://hrtizimchi.uz/panel/api/tariflar'
const offline = process.argv.includes('--offline')

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')

let xato = 0
const xatoBer = (m) => {
  console.error('✗ ' + m)
  xato++
}

/** "199 000" → 199000 */
const son = (s) => Number(String(s).replace(/\s|&nbsp;|\u00a0/g, ''))

/* ── 1. Kartochkalar ── */
// <div class="amt"><span class="cy-m">199 000</span><span class="cy-y">1 990 000</span>
const kartochka = [...html.matchAll(
  /<div class="amt"><span class="cy-m">([^<]+)<\/span><span class="cy-y">([^<]+)<\/span>/g,
)].map((m) => ({ oylik: son(m[1]), yillik: son(m[2]) }))

if (kartochka.length === 0) {
  xatoBer('tarif kartochkalari topilmadi — `.amt` tuzilishi o\'zgarganmi?')
}

/* ── 2. Tanlagichdagi PLANS massivi ── */
// {key:'small', emp:25, br:2, name:"Kichik", m:'199 000', y:'1 990 000'}
const tanlagich = [...html.matchAll(
  // `name` ikkala tirnoq bilan ham yozilishi mumkin va ichida apostrof
  // bo'ladi ("O'rta") — shuning uchun tirnoq turi alohida ushlanadi
  /\{key:'([a-z]+)',\s*emp:([0-9e.+]+),\s*br:([0-9e.+]+),\s*name:\s*(?:"([^"]*)"|'([^']*)'),\s*m:\s*'([^']+)',\s*y:\s*'([^']+)'\}/g,
)].map((m) => ({
  key: m[1],
  emp: Number(m[2]),
  br: Number(m[3]),
  name: m[4] ?? m[5],
  oylik: son(m[6]),
  yillik: son(m[7]),
}))

if (tanlagich.length === 0) {
  xatoBer('tarif tanlagichidagi `PLANS` massivi topilmadi')
}

/* ── Kartochka ↔ tanlagich ── */
if (kartochka.length && tanlagich.length) {
  if (kartochka.length !== tanlagich.length) {
    xatoBer(`kartochkalar ${kartochka.length} ta, tanlagichda ${tanlagich.length} ta tarif`)
  } else {
    kartochka.forEach((k, i) => {
      const t = tanlagich[i]
      if (k.oylik !== t.oylik) {
        xatoBer(`«${t.name}» oylik: kartochkada ${k.oylik}, tanlagichda ${t.oylik}`)
      }
      if (k.yillik !== t.yillik) {
        xatoBer(`«${t.name}» yillik: kartochkada ${k.yillik}, tanlagichda ${t.yillik}`)
      }
    })
  }
}

/* ── 3. Jonli baza ── */
async function bazaBilan() {
  if (offline) {
    console.log('… jonli baza tekshiruvi o\'tkazib yuborildi (--offline)')
    return
  }

  let javob
  try {
    const res = await fetch(TARIF_API, { signal: AbortSignal.timeout(10_000) })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    javob = await res.json()
  } catch (e) {
    // Tarmoq yo'q yoki server o'chgan — bu saytdagi narx xatosi emas
    console.warn(`⚠ ${TARIF_API} ga yetib bo'lmadi (${e.message}) — jonli tekshiruv o'tkazib yuborildi`)
    return
  }

  const baza = javob?.data
  if (!Array.isArray(baza) || baza.length === 0) {
    console.warn('⚠ javobda tarif yo\'q — jonli tekshiruv o\'tkazib yuborildi')
    return
  }

  const bazaKod = new Map(baza.map((p) => [p.code, p]))
  for (const t of tanlagich) {
    const b = bazaKod.get(t.key)
    if (!b) {
      xatoBer(`«${t.name}» (${t.key}) bazada yo'q yoki o'chirilgan`)
      continue
    }
    if (b.monthly !== t.oylik) xatoBer(`«${t.name}» oylik: saytda ${t.oylik}, bazada ${b.monthly}`)
    if (b.yearly !== t.yillik) xatoBer(`«${t.name}» yillik: saytda ${t.yillik}, bazada ${b.yearly}`)

    // Cheksiz tarif saytda 1e9 bilan yoziladi, bazada esa null
    const cheksiz = b.employees === null
    if (!cheksiz && b.employees !== t.emp) {
      xatoBer(`«${t.name}» xodim chegarasi: saytda ${t.emp}, bazada ${b.employees}`)
    }
    if (!cheksiz && b.branches !== t.br) {
      xatoBer(`«${t.name}» filial chegarasi: saytda ${t.br}, bazada ${b.branches}`)
    }
  }

  const saytKod = new Set(tanlagich.map((t) => t.key))
  for (const b of baza) {
    if (!saytKod.has(b.code)) xatoBer(`«${b.name}» (${b.code}) bazada bor, lekin saytda yo'q`)
  }
}

await bazaBilan()

if (xato > 0) {
  console.error(`\n✗ Narxlarda ${xato} ta nomuvofiqlik`)
  process.exit(1)
}
console.log(`✓ Narxlar mos: ${tanlagich.length} ta tarif (kartochka · tanlagich${offline ? '' : ' · baza'})`)
