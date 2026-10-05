/**
 * Built-in Russian versions of the standard (seed) content. Used on the
 * Russian site when the admin has not filled in the "RU" field, so default
 * services, FAQs and directions never show up in Uzbek. Anything the admin
 * types in an RU field always wins. Matching is per line, ignoring case,
 * apostrophe style and surrounding spaces.
 */
const PAIRS: [string, string][] = [
  // Doctor
  ["LOR shifokori (otorinolaringolog)", "ЛОР-врач (оториноларинголог)"],
  ["LOR shifokori", "ЛОР-врач"],
  ["O'zbekiston", "Узбекистан"],
  ["Quloq, burun va tomoq salomatligi", "Здоровье уха, горла и носа"],
  // Directions
  ["Quloq kasalliklari", "Заболевания уха"],
  ["Burun va burun yondosh bo'shliqlari kasalliklari", "Заболевания носа и околоносовых пазух"],
  ["Tomoq va hiqildoq kasalliklari", "Заболевания горла и гортани"],
  ["Bolalar LOR kasalliklari", "Детские ЛОР-заболевания"],
  ["Endoskopik tekshiruv", "Эндоскопическое обследование"],
  ["Allergik rinit", "Аллергический ринит"],
  ["Eshitish buzilishlari", "Нарушения слуха"],
  ["Sinusit", "Синусит"],
  ["Tonzillit", "Тонзиллит"],
  ["Otit", "Отит"],
  // Services
  ["LOR konsultatsiyasi", "Консультация ЛОР-врача"],
  ["Shikoyatlarni o'rganish, quloq, burun va tomoqni ko'rikdan o'tkazish, davolash rejasini tuzish.", "Изучение жалоб, осмотр уха, носа и горла, составление плана лечения."],
  ["Burun bo'shlig'i va hiqildoqni endoskop yordamida batafsil ko'rish.", "Детальный осмотр полости носа и гортани с помощью эндоскопа."],
  ["Quloq tekshiruvi", "Осмотр уха"],
  ["Tashqi va o'rta quloqni otoskopik ko'rikdan o'tkazish.", "Отоскопический осмотр наружного и среднего уха."],
  ["Burun tekshiruvi", "Осмотр носа"],
  ["Burun bo'shlig'i va nafas olish holatini baholash.", "Оценка состояния полости носа и носового дыхания."],
  ["Tomoq tekshiruvi", "Осмотр горла"],
  ["Tomoq, bodomcha bezlar va hiqildoq holatini baholash.", "Оценка состояния горла, миндалин и гортани."],
  ["Bolalar LOR qabuli", "Детский приём ЛОР-врача"],
  ["Bolalar uchun moslashtirilgan LOR ko'rigi va maslahat.", "ЛОР-осмотр и консультация, адаптированные для детей."],
  ["LOR muolajasi", "ЛОР-процедура"],
  ["Umumiy qabul", "Общий приём"],
  ["Audiometriya", "Аудиометрия"],
  ["Timpanometriya", "Тимпанометрия"],
  ["Quloqni yuvish", "Промывание уха"],
  ["Bodomcha bezlarni yuvish", "Промывание миндалин"],
  // FAQ
  ["Qabulga qanday yozilaman?", "Как записаться на приём?"],
  [
    "Saytdagi \"Qabulga yozilish\" tugmasini bosing, xizmat, sana va vaqtni tanlang hamda ma'lumotlaringizni kiriting. Klinika administratori qabulni tasdiqlash uchun siz bilan bog'lanadi.",
    "Нажмите кнопку «Записаться на приём», выберите услугу, дату и время и укажите свои данные. Администратор клиники свяжется с вами для подтверждения записи.",
  ],
  ["Qabul vaqtini o'zgartirish yoki bekor qilish mumkinmi?", "Можно ли перенести или отменить запись?"],
  ["Ha. Buning uchun klinikaga telefon orqali murojaat qiling.", "Да. Для этого позвоните в клинику."],
  ["Qabulga nimalarni olib kelish kerak?", "Что взять с собой на приём?"],
  ["Shaxsingizni tasdiqlovchi hujjat va avvalgi tekshiruv natijalari (agar mavjud bo'lsa).", "Документ, удостоверяющий личность, и результаты предыдущих обследований (если есть)."],
  ["Narxlar qanday aniqlanadi?", "Как определяется стоимость?"],
  [
    "Saytdagi narxlar asosiy xizmatlar uchun. Muolaja narxi shifokor ko'rigidan so'ng aniqlashtiriladi.",
    "Цены на сайте указаны за основные услуги. Стоимость процедуры уточняется после осмотра врача.",
  ],
];

const norm = (s: string) => s.trim().replace(/[ʻʼ‘’`´]/g, "'").replace(/\s+/g, " ").toLowerCase();
const MAP = new Map(PAIRS.map(([uz, ru]) => [norm(uz), ru]));

/** Russian version of a known standard Uzbek text (line by line), or the text unchanged. */
export function autoRu(text: string): string {
  if (!text) return text;
  return text
    .split("\n")
    .map((line) => MAP.get(norm(line)) ?? line)
    .join("\n");
}
