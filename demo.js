/* Tizimchi HR — saytdagi jonli demo.
 *
 * Bu haqiqiy Mini App'ning nusxasi, lekin butunlay brauzerda ishlaydi:
 * server ham, autentifikatsiya ham yo'q. Sabab — Mini App har so'rovda
 * Telegram initData imzosini tekshiradi, brauzerda esa bunday imzo yo'q.
 * Uni "ulash" uchun prod'da imzo tekshiruvini chetlab o'tish kerak bo'lardi,
 * ya'ni haqiqiy mijozlar ma'lumoti turgan tizimda teshik ochilardi.
 *
 * Ma'lumot o'ylab topilgan, lekin qoidalar haqiqiysi bilan bir xil:
 * davomat foizi ta'tildagilarni kutilganlar sonidan chiqaradi, ish haqi
 * ishlangan kundan hisoblanadi, kechikish grace'dan keyin boshlanadi.
 */
(function () {
  'use strict';

  var IP = '46.62.146.132'; // ishlatilmaydi — shunchaki demo haqiqiy tizimdan olinganini eslatadi

  /* ---------------- ma'lumot ---------------- */
  // [ism, lavozim_uz, lavozim_ru, filial, holat, kelish, oylik_maosh]
  var RAW = [
    ['Azizbek Allayorov', 'Tijoriy direktor', 'Коммерческий директор', 'Sadaf', 'in', '08:41', 12000000],
    ['Usmonov Sarvar', 'Project manager', 'Проект-менеджер', 'Sadaf', 'in', '08:55', 9500000],
    ["Nodira Yo'ldosheva", 'Buxgalter', 'Бухгалтер', 'Sadaf', 'in', '08:37', 7200000],
    ['Feruza Aliyeva', 'Ofis menejer', 'Офис-менеджер', 'Sadaf', 'in', '08:49', 5400000],
    ['Jasur Toshmatov', 'Tizim administratori', 'Системный администратор', 'Sadaf', 'in', '08:12', 8100000],
    ['Kamola Rustamova', 'HR menejer', 'HR-менеджер', 'Sadaf', 'leave', null, 7000000],
    ['Otabek Nazarov', 'Dizayner', 'Дизайнер', 'Sadaf', 'in', '09:02', 6800000],
    ['Zilola Umarova', 'Marketolog', 'Маркетолог', 'Sadaf', 'in', '08:58', 6500000],
    ['Sherzod Qodirov', 'Sotuv menejeri', 'Менеджер по продажам', 'Sadaf', 'late', '09:31', 6000000],
    ['Madina Ergasheva', 'Mijozlar bilan ishlash', 'Работа с клиентами', 'Sadaf', 'in', '08:44', 5200000],
    ['Bobur Xolmatov', 'Kontent menejer', 'Контент-менеджер', 'Sadaf', 'in', '08:51', 5600000],
    ['Shahnoza Ismoilova', 'Buxgalter yordamchisi', 'Помощник бухгалтера', 'Sadaf', 'in', '08:39', 4800000],
    ["Ulug'bek Yusupov", 'Yurist', 'Юрист', 'Sadaf', 'in', '09:00', 8500000],
    ['Dilnoza Karimova', 'Rekruter', 'Рекрутер', 'Sadaf', 'abs', null, 5000000],
    ['Raximov Dilshod', "Sotuv bo'limi rahbari", 'Руководитель отдела продаж', 'Hayal', 'in', '08:33', 10500000],
    ['Jamshid Abdullayev', 'Ombor mudiri', 'Заведующий складом', 'Hayal', 'in', '07:58', 7500000],
    ["Malika To'rayeva", 'Sotuv menejeri', 'Менеджер по продажам', 'Hayal', 'in', '08:47', 6000000],
    ['Sardor Karimov', 'Haydovchi', 'Водитель', 'Hayal', 'in', '07:52', 4500000],
    ['Bekzod Ergashev', 'Omborchi', 'Кладовщик', 'Hayal', 'late', '09:18', 4200000],
    ['Aziza Sultonova', 'Kassir', 'Кассир', 'Hayal', 'in', '08:41', 4600000],
    ['Farrux Tursunov', 'Payvand ustasi', 'Сварщик', 'Hayal', 'in', '07:45', 6900000],
    ['Nilufar Qosimova', 'Sifat nazoratchisi', 'Контролёр качества', 'Hayal', 'in', '08:29', 5800000],
    ['Doniyor Sobirov', 'Yuk ortuvchi', 'Грузчик', 'Hayal', 'in', '07:50', 3800000],
    ['Gulnora Rasulova', 'Sotuv menejeri', 'Менеджер по продажам', 'Hayal', 'in', '08:56', 6000000],
    ['Islom Ibrohimov', 'Texnik', 'Техник', 'Hayal', 'in', '08:20', 5500000],
    ['Sevara Nurmatova', 'Sotuv menejeri', 'Менеджер по продажам', 'Hayal', 'in', '08:52', 6000000],
    ['Rustam Ochilov', 'Yuk ortuvchi', 'Грузчик', 'Hayal', 'late', '09:22', 3800000],
    ['Zafar Mirzayev', 'Ekspeditor', 'Экспедитор', 'Hayal', 'in', '08:05', 5100000],
    ['Laylo Xasanova', 'Kassir', 'Кассир', 'Hayal', 'in', '08:38', 4600000],
    ["Akmal Jo'rayev", 'Ombor hisobchisi', 'Учётчик склада', 'Hayal', 'abs', null, 4900000]
  ];

  var EMP = RAW.map(function (r, i) {
    return { id: i, name: r[0], role: { uz: r[1], ru: r[2] }, branch: r[3], st: r[4], in: r[5], sal: r[6] };
  });

  var BRANCHES = [
    { name: 'Sadaf', addr: { uz: 'Toshkent, Chilonzor 12', ru: 'Ташкент, Чиланзар 12' }, r: 100 },
    { name: 'Hayal', addr: { uz: 'Toshkent, Yunusobod 4', ru: 'Ташкент, Юнусабад 4' }, r: 150 }
  ];

  // Ta'til arizalari — tugmalar haqiqatan holatni o'zgartiradi
  var LEAVES = [
    { id: 1, who: 'Otabek Nazarov', type: 'vac', from: '15.08', to: '22.08', days: 6, st: 'pending' },
    { id: 2, who: 'Aziza Sultonova', type: 'sick', from: '11.08', to: '13.08', days: 3, st: 'pending' },
    { id: 3, who: 'Kamola Rustamova', type: 'vac', from: '04.08', to: '17.08', days: 10, st: 'ok' },
    { id: 4, who: 'Doniyor Sobirov', type: 'unpaid', from: '28.07', to: '29.07', days: 2, st: 'no' }
  ];

  var WEEK = [7.6, 8.1, 7.9, 8.4, 8.2, 3.1];
  var TREND = [88, 91, 86, 94, 93, 96, 93];

  /* ---------------- tarjima ---------------- */
  var D = {
    uz: {
      'tab.home': 'Bosh sahifa', 'tab.att': 'Davomat', 'tab.emp': 'Xodimlar', 'tab.pay': 'Ish haqi',
      hello: 'Xush kelibsiz, Greennova', plan: 'Faol · Katta tarif', days: '284 kun qoldi',
      live: 'Bugun · Jonli', rate: 'Davomat darajasi', ofExp: '29 kutilgandan 27 tasi ishda',
      vsLast: "O'tgan haftaga nisbatan +4%", week: 'Ishlangan soat', thisWeek: 'Bu hafta',
      'st.in': 'Keldi', 'st.late': 'Kechikdi', 'st.abs': 'Kelmadi', 'st.leave': "Ta'tilda",
      'st.all': 'Hammasi', notMarked: 'belgilanmadi',
      'sec.team': 'Jamoa', 'sec.day': 'Kunlik ish', 'sec.money': 'Pul', 'sec.an': 'Tahlil', 'sec.acc': 'Akkaunt',
      'm.emp': 'Xodimlar', 'm.br': 'Filiallar', 'm.sch': 'Jadvallar', 'm.att': 'Davomat',
      'm.lv': "Ta'til", 'm.pay': 'Ish haqi', 'm.adv': 'Avans', 'm.rep': 'Hisobotlar',
      'm.prod': 'Mahsuldorlik', 'm.me': 'Mening kabinetim', 'm.set': 'Sozlamalar', 'm.sub': 'Obuna',
      back: 'Orqaga',
      'att.sub': '9-avgust, shanba · 30 xodim', export: 'Eksport',
      'emp.sub': '30 xodim · 2 filial', active: 'Faol',
      'pay.sub': 'Avgust 2026 · hisoblandi', 'pay.emp': 'Xodim', 'pay.model': 'Model',
      'pay.days': 'Kun', 'pay.net': 'Sof summa', 'pay.total': 'Jami to\'lanadi', 'pay.cnt': '30 xodim uchun',
      'pay.more': 'va yana 22 ta xodim', 'md.month': 'Oylik', 'md.day': 'Kunlik', 'md.hour': 'Soatlik',
      'rep.sub': 'Turini va oralig\'ini tanlang', 'rep.t1': 'Davomat', 'rep.t2': 'Kechikishlar',
      'rep.t3': 'Ishlangan soat', 'rep.t4': 'Ish haqi', 'rep.t5': 'Tabel', 'rep.t6': 'Filial kesimi',
      'rep.p1': 'Bugun', 'rep.p2': "So'nggi 7 kun", 'rep.p3': 'Joriy oy', 'rep.p4': 'Maxsus',
      'rep.make': 'Hisobotni yaratish', 'rep.toast': 'Namunada fayl yaratilmaydi — botda XLSX va PDF keladi',
      'prod.sub': 'Avgust 2026 · o\'tgan oy bilan taqqoslangan', 'prod.rate': 'Davomat darajasi',
      'prod.hours': "O'rtacha ishlangan soat", 'prod.late': "O'rtacha kechikish", 'prod.abs': 'Kelmagan kun',
      'prod.trend': 'Haftalik trend', 'prod.br': 'Filial reytingi', 'prod.top': 'Eng puxta xodimlar',
      'lv.sub': '2 ta ariza kutmoqda', 'lv.pending': 'Ko\'rib chiqilmoqda', 'lv.ok': 'Tasdiqlangan',
      'lv.no': 'Rad etilgan', 'lv.approve': 'Tasdiqlash', 'lv.reject': 'Rad etish',
      'lv.vac': "Mehnat ta'tili", 'lv.sick': 'Kasallik', 'lv.unpaid': 'To\'lovsiz',
      'lv.toastOk': 'Tasdiqlandi — xodimga Telegram xabari ketdi',
      'lv.toastNo': 'Rad etildi — xodimga sabab bilan xabar ketdi', 'lv.d': 'kun',
      'br.sub': '2 filial · GPS geofence', 'br.radius': 'radius', 'br.emp': 'xodim',
      'me.sub': 'Shaxsiy kabinet', 'me.today': 'Bugungi holat', 'me.atwork': 'Ishdasiz',
      'me.left': 'Ish tugadi', 'me.came': 'Keldingiz', 'me.checkout': 'Ketdim', 'me.checkin': 'Keldim',
      'me.geo': 'Joylashuv faqat tugma bosilganda o\'qiladi',
      'me.mon': 'Avgust yakuni', 'me.wd': 'Ishlangan kun', 'me.wh': 'Ishlangan soat',
      'me.sal': 'Joriy hisob', 'me.toast': 'Ketish qayd etildi · 9 soat 23 daqiqa',
      'set.sub': 'Kompaniya sozlamalari', 'set.brand': 'Brend rangi', 'set.lang': 'Til',
      'set.tz': 'Vaqt zonasi', 'set.notif': 'Bildirishnoma vaqtlari', 'set.att': 'Davomat eslatmasi',
      'set.rep': 'Kunlik hisobot', 'set.wd': 'Ish kunlari',
      'sub.sub': 'Katta tarif · 100 xodim', 'sub.until': '2027-yil 20-may gacha',
      'sub.used': 'ishlatilgan', 'sub.upgrade': 'Tarifni o\'zgartirish',
      'sub.toast': 'Namunada to\'lov qilinmaydi — botda karta yoki Payme/Click orqali',
      som: "so'm", hour: 'soat'
    },
    ru: {
      'tab.home': 'Главная', 'tab.att': 'Учёт', 'tab.emp': 'Сотрудники', 'tab.pay': 'Зарплата',
      hello: 'Добро пожаловать, Greennova', plan: 'Активен · тариф Большой', days: 'осталось 284 дня',
      live: 'Сегодня · Онлайн', rate: 'Уровень посещаемости', ofExp: '27 из 29 ожидаемых на работе',
      vsLast: 'На 4% больше, чем неделю назад', week: 'Отработано часов', thisWeek: 'Эта неделя',
      'st.in': 'Пришёл', 'st.late': 'Опоздал', 'st.abs': 'Отсутствует', 'st.leave': 'В отпуске',
      'st.all': 'Все', notMarked: 'не отмечен',
      'sec.team': 'Команда', 'sec.day': 'Ежедневное', 'sec.money': 'Деньги', 'sec.an': 'Аналитика', 'sec.acc': 'Аккаунт',
      'm.emp': 'Сотрудники', 'm.br': 'Филиалы', 'm.sch': 'Графики', 'm.att': 'Учёт времени',
      'm.lv': 'Отпуска', 'm.pay': 'Зарплата', 'm.adv': 'Аванс', 'm.rep': 'Отчёты',
      'm.prod': 'Продуктивность', 'm.me': 'Мой кабинет', 'm.set': 'Настройки', 'm.sub': 'Подписка',
      back: 'Назад',
      'att.sub': '9 августа, суббота · 30 сотрудников', export: 'Выгрузка',
      'emp.sub': '30 сотрудников · 2 филиала', active: 'Активен',
      'pay.sub': 'Август 2026 · рассчитано', 'pay.emp': 'Сотрудник', 'pay.model': 'Модель',
      'pay.days': 'Дней', 'pay.net': 'К выплате', 'pay.total': 'Итого к выплате', 'pay.cnt': 'на 30 сотрудников',
      'pay.more': 'и ещё 22 сотрудника', 'md.month': 'Оклад', 'md.day': 'Дневная', 'md.hour': 'Почасовая',
      'rep.sub': 'Выберите тип и период', 'rep.t1': 'Посещаемость', 'rep.t2': 'Опоздания',
      'rep.t3': 'Отработанные часы', 'rep.t4': 'Зарплата', 'rep.t5': 'Табель', 'rep.t6': 'По филиалам',
      'rep.p1': 'Сегодня', 'rep.p2': 'Последние 7 дней', 'rep.p3': 'Текущий месяц', 'rep.p4': 'Свой период',
      'rep.make': 'Сформировать отчёт', 'rep.toast': 'В демо файл не создаётся — в боте придут XLSX и PDF',
      'prod.sub': 'Август 2026 · в сравнении с прошлым месяцем', 'prod.rate': 'Посещаемость',
      'prod.hours': 'Среднее отработано', 'prod.late': 'Среднее опоздание', 'prod.abs': 'Дней отсутствия',
      'prod.trend': 'Недельный тренд', 'prod.br': 'Рейтинг филиалов', 'prod.top': 'Самые дисциплинированные',
      'lv.sub': '2 заявки ожидают', 'lv.pending': 'На рассмотрении', 'lv.ok': 'Одобрено',
      'lv.no': 'Отклонено', 'lv.approve': 'Одобрить', 'lv.reject': 'Отклонить',
      'lv.vac': 'Трудовой отпуск', 'lv.sick': 'Больничный', 'lv.unpaid': 'Без содержания',
      'lv.toastOk': 'Одобрено — сотруднику ушло сообщение в Telegram',
      'lv.toastNo': 'Отклонено — сотруднику ушло сообщение с причиной', 'lv.d': 'дн.',
      'br.sub': '2 филиала · GPS-геозона', 'br.radius': 'радиус', 'br.emp': 'сотруд.',
      'me.sub': 'Личный кабинет', 'me.today': 'Статус на сегодня', 'me.atwork': 'Вы на работе',
      'me.left': 'Смена завершена', 'me.came': 'Пришли', 'me.checkout': 'Ушёл', 'me.checkin': 'Пришёл',
      'me.geo': 'Местоположение считывается только при нажатии',
      'me.mon': 'Итоги августа', 'me.wd': 'Отработано дней', 'me.wh': 'Отработано часов',
      'me.sal': 'Текущий расчёт', 'me.toast': 'Уход зафиксирован · 9 часов 23 минуты',
      'set.sub': 'Настройки компании', 'set.brand': 'Цвет бренда', 'set.lang': 'Язык',
      'set.tz': 'Часовой пояс', 'set.notif': 'Время уведомлений', 'set.att': 'Напоминание об отметке',
      'set.rep': 'Итог дня', 'set.wd': 'Рабочие дни',
      'sub.sub': 'Тариф Большой · 100 сотрудников', 'sub.until': 'до 20 мая 2027 года',
      'sub.used': 'использовано', 'sub.upgrade': 'Сменить тариф',
      'sub.toast': 'В демо оплата не проходит — в боте картой либо Payme/Click',
      som: 'сум', hour: 'ч'
    }
  };

  var lang = (document.documentElement.lang === 'ru') ? 'ru' : 'uz';
  function t(k) { return (D[lang] && D[lang][k]) || D.uz[k] || k; }
  function role(e) { return e.role[lang] || e.role.uz; }

  /* ---------------- yordamchilar ---------------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  function ini(n) { var p = n.split(' '); return ((p[0] || '')[0] + (p[1] || '')[0] || '?').toUpperCase(); }
  var AV = ['#2b7bff,#0f57e0', '#f0a13c,#d97706', '#34b27b,#0e9f6e', '#8b5cf6,#6d28d9', '#ef6c8a,#d1345b', '#0ea5b7,#0b7c8a'];
  function av(e) {
    var g = AV[e.id % AV.length];
    return '<span class="av" style="background:linear-gradient(150deg,' + g + ')">' + esc(ini(e.name)) + '</span>';
  }
  function money(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  var CH = { in: 'ok', late: 'late', abs: 'abs', leave: 'ok' };
  function chip(st) { return '<span class="chip ' + (CH[st] || 'ok') + '">' + t('st.' + st) + '</span>'; }

  var count = { in: 0, late: 0, abs: 0, leave: 0 };
  EMP.forEach(function (e) { count[e.st]++; });
  var TOTAL = EMP.length;
  var EXPECTED = TOTAL - count.leave;
  var PRESENT = count.in + count.late;
  var RATE = Math.round((PRESENT / EXPECTED) * 100);

  /* ---------------- holat ---------------- */
  var S = { screen: 'home', filter: 'all', repType: 0, repPreset: 1, atWork: true, dir: 'push' };

  var body = document.getElementById('demoBody');
  var tabsEl = document.getElementById('demoTabs');
  var toastEl;
  var lastScreen = null;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.classList.remove('on'); }, 3200);
  }

  // Chuqurlik: bosh sahifa 0, qolgani 1. Ichkariga kirish — o'ngdan surilish,
  // qaytish — chapdan. iOS navigatsiyasi shunday ishlaydi.
  function depth(sc) { return sc === 'home' ? 0 : 1; }
  function go(screen) {
    S.dir = depth(screen) < depth(S.screen) ? 'pop' : 'push';
    S.screen = screen;
    render();
    body.scrollTop = 0;
  }

  /* ---------------- ikonkalar ---------------- */
  var I = {
    emp: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    br: '<path d="M3 21V9l9-6 9 6v12"/><path d="M9 21v-7h6v7"/>',
    sch: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 11h18"/>',
    att: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    lv: '<path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="6" width="18" height="15" rx="3"/><path d="M9 15l2 2 4-4"/>',
    pay: '<rect x="2" y="6" width="20" height="13" rx="3"/><path d="M2 11h20M6 15h4"/>',
    adv: '<path d="M12 2v20"/><path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    rep: '<path d="M14 3v5h5"/><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M8 13h8M8 17h5"/>',
    prod: '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/>',
    me: '<circle cx="12" cy="8" r="4"/><path d="M5 21v-1a7 7 0 0 1 14 0v1"/>',
    set: '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a2 2 0 1 1-4 0V21a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.3 8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 4.1V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    sub: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18"/>'
  };
  function ic(k) { return '<svg viewBox="0 0 24 24">' + I[k] + '</svg>'; }

  function mod(key, screen, sub) {
    return '<button class="dm-mod" data-go="' + screen + '">' + ic(key) +
      '<b>' + t('m.' + key) + '</b><span>' + sub + '</span></button>';
  }

  function head(title, sub) {
    return '<div class="dm-head"><button class="dm-back" data-go="home" aria-label="' + t('back') + '">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 19l-7-7 7-7"/></svg></button>' +
      '<div><div class="dm-title">' + title + '</div><div class="dm-sub">' + sub + '</div></div></div>';
  }

  /* ---------------- ekranlar ---------------- */
  var SCREENS = {};

  SCREENS.home = function () {
    var ring = 2 * Math.PI * 34, off = ring * (1 - RATE / 100);
    return '' +
      '<div class="dm-hello">' + t('hello') + '</div>' +
      '<div class="dm-co"><span class="dm-badge ok">' + t('plan') + '</span><span class="dm-badge info">' + t('days') + '</span></div>' +
      '<div class="tile">' +
        '<div class="tile-h"><span class="tile-t">' + t('live') + '</span><span class="pill-time">14:20</span></div>' +
        '<div class="kpis">' +
          kpi('k1', count.in, t('st.in'), 'in') + kpi('k2', count.late, t('st.late'), 'late') +
          kpi('k3', count.abs, t('st.abs'), 'abs') + kpi('k4', count.leave, t('st.leave'), 'leave') +
        '</div>' +
        '<div class="ring-wrap" style="margin-top:13px">' +
          '<svg width="74" height="74" viewBox="0 0 82 82" style="flex:none">' +
            '<circle cx="41" cy="41" r="34" fill="none" stroke="var(--surface-3)" stroke-width="10"/>' +
            '<circle cx="41" cy="41" r="34" fill="none" stroke="var(--brand)" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + ring.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 41 41)"/>' +
            '<text x="41" y="47" text-anchor="middle" font-size="18" font-weight="700" fill="currentColor" letter-spacing="-1">' + RATE + '%</text>' +
          '</svg>' +
          '<div><div style="font-size:12.5px;font-weight:550">' + t('rate') + '</div>' +
          '<div style="font-size:12px;color:var(--muted);margin-top:3px">' + t('ofExp') + '</div>' +
          '<div style="font-size:11.5px;color:var(--ok-ink);margin-top:3px">' + t('vsLast') + '</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="dm-sect">' + t('sec.team') + '</div>' +
      '<div class="dm-grid">' + mod('emp', 'employees', TOTAL + ' / 100') + mod('br', 'branches', '2 / 5') + mod('sch', 'schedules', '3') + '</div>' +
      '<div class="dm-sect">' + t('sec.day') + '</div>' +
      '<div class="dm-grid">' + mod('att', 'attendance', PRESENT + ' / ' + EXPECTED) + mod('lv', 'leaves', '2') + mod('me', 'me', '') + '</div>' +
      '<div class="dm-sect">' + t('sec.money') + '</div>' +
      '<div class="dm-grid">' + mod('pay', 'payroll', '30') + mod('adv', 'payroll', '1') + mod('sub', 'subscription', '') + '</div>' +
      '<div class="dm-sect">' + t('sec.an') + '</div>' +
      '<div class="dm-grid">' + mod('rep', 'reports', '6') + mod('prod', 'productivity', '') + mod('set', 'settings', '') + '</div>';
  };

  function kpi(cls, n, label, st) {
    return '<button class="kpi ' + cls + '" data-go="attendance" data-filter="' + st + '" style="border:0;cursor:pointer;font:inherit">' +
      '<b>' + n + '</b><small>' + label + '</small></button>';
  }

  SCREENS.attendance = function () {
    var list = EMP.filter(function (e) { return S.filter === 'all' || e.st === S.filter; });
    var h = head(t('m.att'), t('att.sub'));
    h += '<div class="dm-chips">';
    [['all', TOTAL], ['in', count.in], ['late', count.late], ['abs', count.abs], ['leave', count.leave]].forEach(function (p) {
      h += '<button class="dm-chip' + (S.filter === p[0] ? ' on' : '') + '" data-filter="' + p[0] + '">' +
        t('st.' + p[0]) + '<span class="n">' + p[1] + '</span></button>';
    });
    h += '</div>';

    if (!list.length) return h + '<div class="dm-empty">—</div>';

    BRANCHES.forEach(function (b) {
      var rows = list.filter(function (e) { return e.branch === b.name; });
      if (!rows.length) return;
      h += '<div class="dm-branch">' + b.name + ' · ' + rows.length + '</div><div class="rows" style="margin-top:0">';
      rows.forEach(function (e) {
        h += '<div class="row">' + av(e) +
          '<span><span class="row-n">' + esc(e.name) + '</span><br><span class="row-r">' + esc(role(e)) + ' · ' + (e.in || t('notMarked')) + '</span></span>' +
          chip(e.st) + '</div>';
      });
      h += '</div>';
    });
    return h;
  };

  SCREENS.employees = function () {
    var h = head(t('m.emp'), t('emp.sub')) + '<div class="rows" style="margin-top:0">';
    EMP.forEach(function (e) {
      h += '<div class="row">' + av(e) +
        '<span><span class="row-n">' + esc(e.name) + '</span><br><span class="row-r">' + esc(role(e)) + ' · ' + e.branch + '</span></span>' +
        '<span class="chip ok">' + t('active') + '</span></div>';
    });
    return h + '</div>';
  };

  SCREENS.payroll = function () {
    // Sof summa = baza − kelmagan kun ushlanmasi (22 ish kuni bo'yicha)
    var WD = 22;
    var total = 0;
    var rows = EMP.map(function (e) {
      var miss = e.st === 'abs' ? 1 : 0;
      var net = Math.round(e.sal - (e.sal / WD) * miss);
      total += net;
      return { e: e, days: WD - miss, net: net };
    });
    // Telefon eniga uch ustun sig'adi — "model" ism ostiga tushadi
    var h = head(t('m.pay'), t('pay.sub')) + '<table class="dm-tbl"><thead><tr>' +
      '<th>' + t('pay.emp') + '</th><th class="num">' + t('pay.days') + '</th><th class="num">' + t('pay.net') + '</th>' +
      '</tr></thead><tbody>';
    rows.slice(0, 8).forEach(function (r) {
      h += '<tr><td>' + esc(r.e.name) + '<br><span style="font-size:10.5px;color:var(--muted)">' + t('md.month') + '</span></td>' +
        '<td class="num">' + r.days + '</td><td class="num">' + money(r.net) + '</td></tr>';
    });
    h += '</tbody></table><div class="dm-empty" style="padding:12px">' + t('pay.more') + '</div>';
    h += '<div class="dm-tot"><span>' + t('pay.total') + '<br><span style="opacity:.75">' + t('pay.cnt') + '</span></span>' +
      '<b>' + money(total) + ' ' + t('som') + '</b></div>';
    return h;
  };

  SCREENS.reports = function () {
    var types = ['rep.t1', 'rep.t2', 'rep.t3', 'rep.t4', 'rep.t5', 'rep.t6'];
    var h = head(t('m.rep'), t('rep.sub')) + '<div class="dm-grid" style="margin-top:0">';
    types.forEach(function (k, i) {
      h += '<button class="dm-mod' + (S.repType === i ? ' on' : '') + '" data-rep="' + i + '"' +
        (S.repType === i ? ' style="border-color:var(--brand);background:var(--surface-2)"' : '') + '>' +
        ic('rep') + '<b>' + t(k) + '</b><span>XLSX · PDF</span></button>';
    });
    h += '</div><div class="dm-sect">' + t('rep.p3') + '</div><div class="dm-chips">';
    ['rep.p1', 'rep.p2', 'rep.p3', 'rep.p4'].forEach(function (k, i) {
      h += '<button class="dm-chip' + (S.repPreset === i ? ' on' : '') + '" data-preset="' + i + '">' + t(k) + '</button>';
    });
    h += '</div><button class="dm-btn p big" data-toast="rep.toast">' + t('rep.make') + '</button>';
    return h;
  };

  SCREENS.productivity = function () {
    var h = head(t('m.prod'), t('prod.sub'));
    h += '<div class="dm-two">' +
      stat(RATE + '%', t('prod.rate'), '+4%') + stat('8.1 ' + t('hour'), t('prod.hours'), '+0.3') +
      stat('11 daq', t('prod.late'), '−4') + stat('2', t('prod.abs'), '−1') + '</div>';
    h += '<div class="tile" style="margin-top:10px"><div class="tile-h"><span class="tile-t">' + t('prod.trend') + '</span></div>' +
      '<div class="bars">' + TREND.map(function (v) { return '<i style="height:' + v + '%"></i>'; }).join('') + '</div>' +
      '<div class="bar-x">' + ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map(function (d) { return '<span>' + d + '</span>'; }).join('') + '</div></div>';
    h += '<div class="tile" style="margin-top:10px"><div class="tile-h"><span class="tile-t">' + t('prod.br') + '</span></div>' +
      barRow('Sadaf', 95) + barRow('Hayal', 91) + '</div>';
    h += '<div class="tile" style="margin-top:10px"><div class="tile-h"><span class="tile-t">' + t('prod.top') + '</span></div>' +
      ['Farrux Tursunov', 'Sardor Karimov', 'Doniyor Sobirov'].map(function (n, i) {
        return '<div class="dm-rank"><span class="pos">' + (i + 1) + '</span>' + esc(n) + '<span class="val">' + (100 - i) + '%</span></div>';
      }).join('') + '</div>';
    return h;
  };
  function stat(big, lbl, delta) {
    return '<div class="tile"><div class="dm-bignum">' + big + '</div><div class="dm-lbl">' + lbl + '</div>' +
      '<div style="font-size:11.5px;color:var(--ok-ink);margin-top:4px">' + delta + '</div></div>';
  }
  function barRow(n, v) {
    return '<div style="margin-bottom:9px"><div style="display:flex;font-size:12.5px"><span>' + n + '</span><span style="margin-left:auto;font-weight:650">' + v + '%</span></div>' +
      '<div class="dm-bar"><i style="width:' + v + '%"></i></div></div>';
  }

  SCREENS.leaves = function () {
    var pend = LEAVES.filter(function (l) { return l.st === 'pending'; });
    var h = head(t('m.lv'), pend.length ? t('lv.sub') : t('lv.ok'));
    LEAVES.forEach(function (l) {
      h += '<div class="dm-card"><h4>' + esc(l.who) + '</h4>' +
        '<p>' + t('lv.' + l.type) + ' · ' + l.from + '–' + l.to + ' · ' + l.days + ' ' + t('lv.d') + '</p>';
      if (l.st === 'pending') {
        h += '<div class="dm-acts"><button class="dm-btn p" data-lv="' + l.id + '" data-act="ok">' + t('lv.approve') + '</button>' +
          '<button class="dm-btn s" data-lv="' + l.id + '" data-act="no">' + t('lv.reject') + '</button></div>';
      } else {
        h += '<div style="margin-top:9px">' + '<span class="chip ' + (l.st === 'ok' ? 'ok' : 'abs') + '" style="margin:0">' +
          t(l.st === 'ok' ? 'lv.ok' : 'lv.no') + '</span></div>';
      }
      h += '</div>';
    });
    return h;
  };

  SCREENS.branches = function () {
    var h = head(t('m.br'), t('br.sub'));
    BRANCHES.forEach(function (b) {
      var n = EMP.filter(function (e) { return e.branch === b.name; }).length;
      h += '<div class="dm-card"><h4>' + b.name + '</h4><p>' + (b.addr[lang] || b.addr.uz) + '</p>' +
        '<div class="dm-acts" style="gap:14px;font-size:12px;color:var(--muted)">' +
        '<span><b style="color:var(--ink)">' + b.r + ' m</b> ' + t('br.radius') + '</span>' +
        '<span><b style="color:var(--ink)">' + n + '</b> ' + t('br.emp') + '</span></div></div>';
    });
    h += '<div class="mock-foot" style="margin-top:4px"><span style="width:32px;height:32px;border-radius:10px;background:rgba(255,255,255,.14);display:grid;place-items:center;flex:none">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg></span>' +
      '<span><b>Sadaf · 100 m geofence</b><small>' + (lang === 'ru' ? 'Попытка вне зоны не принимается' : "Hudud tashqarisidagi urinish qabul qilinmaydi") + '</small></span></div>';
    return h;
  };

  SCREENS.me = function () {
    var h = head(t('m.me'), t('me.sub'));
    h += '<div class="tile" style="text-align:center;padding:20px">' +
      '<div class="dm-lbl">' + t('me.today') + '</div>' +
      '<div class="dm-bignum" style="margin:5px 0 3px">' + (S.atWork ? t('me.atwork') : t('me.left')) + '</div>' +
      '<div class="dm-lbl">' + t('me.came') + ': 08:41 · Sadaf</div></div>';
    h += '<button class="dm-btn p big" style="margin-top:10px" data-me="1">' + (S.atWork ? t('me.checkout') : t('me.checkin')) + '</button>';
    h += '<div class="dm-hint" style="margin-top:9px;justify-content:center;font-size:11px;color:var(--muted)">' + t('me.geo') + '</div>';
    h += '<div class="dm-sect">' + t('me.mon') + '</div><div class="dm-two">' +
      '<div class="tile"><div class="dm-bignum">18</div><div class="dm-lbl">' + t('me.wd') + '</div></div>' +
      '<div class="tile"><div class="dm-bignum">146</div><div class="dm-lbl">' + t('me.wh') + '</div></div></div>';
    h += '<div class="dm-tot" style="margin-top:10px"><span>' + t('me.sal') + '</span><b>9 818 000 ' + t('som') + '</b></div>';
    return h;
  };

  SCREENS.settings = function () {
    var h = head(t('m.set'), t('set.sub'));
    h += '<div class="dm-card"><h4>' + t('set.brand') + '</h4>' +
      '<div class="dm-acts" style="gap:7px">' +
      ['#1a6dff', '#0e9f6e', '#d97706', '#8b5cf6', '#e02424'].map(function (c, i) {
        return '<span style="width:30px;height:30px;border-radius:9px;background:' + c + ';' + (i === 0 ? 'box-shadow:0 0 0 3px var(--surface),0 0 0 5px ' + c : '') + '"></span>';
      }).join('') + '</div></div>';
    h += '<div class="dm-card"><h4>' + t('set.notif') + '</h4>' +
      '<div class="dm-acts" style="gap:14px;font-size:12.5px"><span style="color:var(--muted)">' + t('set.att') + ' <b style="color:var(--ink)">08:30</b></span>' +
      '<span style="color:var(--muted)">' + t('set.rep') + ' <b style="color:var(--ink)">18:00</b></span></div></div>';
    h += '<div class="dm-card"><h4>' + t('set.wd') + '</h4><div class="dm-chips" style="margin:9px 0 0">' +
      ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map(function (d, i) {
        return '<span class="dm-chip' + (i < 5 ? ' on' : '') + '">' + d + '</span>';
      }).join('') + '</div></div>';
    h += '<div class="dm-card"><h4>' + t('set.lang') + ' · ' + t('set.tz') + '</h4>' +
      '<p>' + (lang === 'ru' ? 'Русский · UTC+5 (Ташкент)' : "O'zbekcha · UTC+5 (Toshkent)") + '</p></div>';
    return h;
  };

  SCREENS.subscription = function () {
    var h = head(t('m.sub'), t('sub.sub'));
    h += '<div class="dm-tot" style="margin-bottom:12px"><span>' + t('plan') + '<br><span style="opacity:.75">' + t('sub.until') + '</span></span><b>499 000</b></div>';
    [[t('m.emp'), TOTAL, 100], [t('m.br'), 2, 5], ['Admin', 4, 10]].forEach(function (r) {
      h += '<div style="margin-bottom:11px"><div style="display:flex;font-size:12.5px"><span>' + r[0] + '</span>' +
        '<span style="margin-left:auto;color:var(--muted)">' + r[1] + ' / ' + r[2] + ' ' + t('sub.used') + '</span></div>' +
        '<div class="dm-bar"><i style="width:' + Math.round(r[1] / r[2] * 100) + '%"></i></div></div>';
    });
    h += '<button class="dm-btn p big" style="margin-top:6px" data-toast="sub.toast">' + t('sub.upgrade') + '</button>';
    return h;
  };

  /* ---------------- chizish ----------------
     Pastki tab qatori — haqiqiy Mini App'dagidek. Bosh sahifadan tashqari
     ekranlar (ta'til, filial, hisobot...) modul gridi orqali ochiladi va
     "Bosh sahifa" tabi yoniq qoladi: mehmon qayerdan kelganini yo'qotmasin. */
  var TABS = [
    ['home', 'tab.home', '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5"/><path d="M9.5 21v-6h5v6"/>'],
    ['attendance', 'tab.att', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.2 2"/>'],
    ['employees', 'tab.emp', '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'],
    ['payroll', 'tab.pay', '<rect x="2.5" y="6" width="19" height="13" rx="3"/><path d="M2.5 10.5h19"/><circle cx="17.3" cy="15" r="1.3"/>']
  ];
  // Modul gridi orqali ochiladigan ekranlar bosh sahifaga tegishli
  var UNDER_HOME = { leaves: 1, branches: 1, reports: 1, productivity: 1, me: 1, settings: 1, subscription: 1, schedules: 1 };

  function render() {
    tabsEl.innerHTML = TABS.map(function (p) {
      var on = S.screen === p[0] || (p[0] === 'home' && UNDER_HOME[S.screen]);
      return '<button data-go="' + p[0] + '"' + (on ? ' class="on"' : '') + '>' +
        '<svg viewBox="0 0 24 24">' + p[2] + '</svg>' + t(p[1]) + '</button>';
    }).join('');
    var fn = SCREENS[S.screen] || SCREENS.home;
    body.innerHTML = '<div class="dm-in' + (S.dir === 'pop' ? ' pop' : '') + '">' + fn() + '</div>';
    // Ekran almashganda tepaga qaytamiz; o'sha ekran ichida (filtr, tasdiqlash)
    // surilish joyida qoladi, aks holda mehmon bosgan joyidan ayrilib qolardi.
    if (lastScreen !== S.screen) { body.scrollTop = 0; lastScreen = S.screen; }
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'dm-toast';
      // Ekran ICHIGA qo'yiladi — telefon bilan birga masshtablanadi
      (document.querySelector('.phone-screen') || document.getElementById('demo')).appendChild(toastEl);
    }
  }

  /* ---------------- hodisalar ---------------- */
  document.getElementById('demo').addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-go],[data-filter],[data-rep],[data-preset],[data-lv],[data-toast],[data-me]');
    if (!el) return;

    if (el.hasAttribute('data-filter') && !el.hasAttribute('data-go')) { S.filter = el.getAttribute('data-filter'); render(); return; }
    if (el.hasAttribute('data-go')) {
      if (el.hasAttribute('data-filter')) S.filter = el.getAttribute('data-filter');
      go(el.getAttribute('data-go'));
      return;
    }
    if (el.hasAttribute('data-rep')) { S.repType = +el.getAttribute('data-rep'); render(); return; }
    if (el.hasAttribute('data-preset')) { S.repPreset = +el.getAttribute('data-preset'); render(); return; }
    if (el.hasAttribute('data-toast')) { toast(t(el.getAttribute('data-toast'))); return; }
    if (el.hasAttribute('data-me')) { S.atWork = !S.atWork; render(); if (!S.atWork) toast(t('me.toast')); return; }
    if (el.hasAttribute('data-lv')) {
      var id = +el.getAttribute('data-lv'), act = el.getAttribute('data-act');
      LEAVES.forEach(function (l) { if (l.id === id) l.st = act; });
      render();
      toast(t(act === 'ok' ? 'lv.toastOk' : 'lv.toastNo'));
      return;
    }
  });

  // Til almashsa — qayta chizamiz. Asosiy skript `documentElement.lang` ni yozadi,
  // shuning uchun uni o'zgargandan keyin o'qiymiz.
  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () {
      setTimeout(function () {
        lang = (document.documentElement.lang === 'ru') ? 'ru' : 'uz';
        render();
      }, 0);
    });
  });

  /* ---------------- haqiqiy telefon sezgisi ---------------- */
  // Surilganda yuqori panel ostida ingichka chiziq paydo bo'ladi
  var top = document.getElementById('phTop');
  if (top) {
    body.addEventListener('scroll', function () {
      top.classList.toggle('scrolled', body.scrollTop > 4);
    }, { passive: true });
  }

  // Status qatoridagi soat haqiqiy — namuna "muzlab qolgan" ko'rinmasin
  var clock = document.getElementById('phTime');
  function tick() {
    if (!clock) return;
    var d = new Date();
    clock.textContent = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  tick();
  setInterval(tick, 20000);

  render();
})();
