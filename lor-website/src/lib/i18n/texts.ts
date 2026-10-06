import type { Dictionary, Locale } from "./index";

/**
 * Site texts the doctor can rewrite in Admin → Site texts. Overrides are kept
 * in Setting.texts as { uz: { path: text }, ru: { path: text } } and laid over
 * the built-in dictionaries; an empty override falls back to the default.
 */

export type TextOverrides = Partial<Record<Locale, Record<string, string>>>;
type Field = { path: string; uz: string; ru: string; long?: boolean };
export type TextGroup = { id: string; uz: string; ru: string; fields: Field[] };

const f = (path: string, uz: string, ru: string, long = false): Field => ({ path, uz, ru, long });

export const TEXT_GROUPS: TextGroup[] = [
  {
    id: "menu", uz: "Menyu va tugmalar", ru: "Меню и кнопки",
    fields: [
      f("nav.home", "Bosh sahifa", "Главная"),
      f("nav.about", "Shifokor haqida", "О враче"),
      f("site.directions", "Yo'nalishlar", "Направления"),
      f("site.prices", "Narxlar", "Цены"),
      f("site.reviews", "Fikrlar", "Отзывы"),
      f("nav.faq", "Savollar", "Вопросы"),
      f("nav.contact", "Aloqa", "Контакты"),
      f("common.bookAppointment", "«Qabulga yozilish» tugmasi", "Кнопка «Записаться»"),
      f("site.call", "«Qo'ng'iroq qilish» tugmasi", "Кнопка «Позвонить»"),
    ],
  },
  {
    id: "hero", uz: "Bosh qism (eng tepa)", ru: "Главный экран",
    fields: [
      f("hero.specialty", "Mutaxassislik yozuvi", "Подпись специальности"),
      f("site.heroTitle", "Katta sarlavha", "Большой заголовок"),
      f("site.heroLead", "Sarlavha ostidagi matn", "Текст под заголовком", true),
      f("hero.todayHours", "«Bugun qabul»", "«Сегодня приём»"),
      f("hero.closedToday", "«Bugun dam olish kuni»", "«Сегодня выходной»"),
      f("site.instagramMy", "Instagram tugmasi", "Кнопка Instagram"),
    ],
  },
  {
    id: "stats", uz: "Raqamlar ostidagi yozuvlar", ru: "Подписи к цифрам",
    fields: [
      f("trust.experience", "Tajriba", "Опыт"),
      f("trust.patients", "Bemorlar", "Пациенты"),
      f("trust.procedures", "Muolajalar", "Процедуры"),
      f("trust.certifications", "Sertifikatlar", "Сертификаты"),
    ],
  },
  {
    id: "advantages", uz: "Afzalliklar", ru: "Преимущества",
    fields: [
      f("site.advantages", "Bo'lim nomi", "Название раздела"),
      ...[0, 1, 2, 3].flatMap((i) => [
        f(`site.trust.${i}.title`, `${i + 1}-afzallik sarlavhasi`, `Преимущество ${i + 1}: заголовок`),
        f(`site.trust.${i}.text`, `${i + 1}-afzallik matni`, `Преимущество ${i + 1}: текст`, true),
      ]),
    ],
  },
  {
    id: "about", uz: "Shifokor haqida", ru: "О враче",
    fields: [
      f("about.eyebrow", "Bo'lim nomi", "Название раздела"),
      f("about.expertise", "«Asosiy yo'nalishlar»", "«Основные направления»"),
      f("site.aboutCardsTitle", "«Tajriba va malaka»", "«Опыт и квалификация»"),
      f("experience.title", "«Kasbiy yo'l»", "«Профессиональный путь»"),
      f("qualifications.education", "«Ta'lim»", "«Образование»"),
      f("qualifications.training", "«Malaka oshirish»", "«Повышение квалификации»"),
      f("qualifications.certifications", "«Sertifikatlar»", "«Сертификаты»"),
      f("qualifications.memberships", "«A'zolik»", "«Членство»"),
    ],
  },
  {
    id: "services", uz: "Yo'nalishlar va narxlar", ru: "Направления и цены",
    fields: [
      f("site.directionsTitle", "Yo'nalishlar sarlavhasi", "Заголовок направлений"),
      f("site.allServices", "«Barcha xizmatlar» tugmasi", "Кнопка «Все услуги»"),
      f("site.pricesTitle", "Narxlar sarlavhasi", "Заголовок цен"),
      f("pricing.lead", "Narxlar ostidagi izoh", "Пояснение под ценами", true),
      f("pricing.consultations", "«Qabul va tekshiruvlar»", "«Приём и обследования»"),
      f("pricing.procedures", "«Muolajalar»", "«Процедуры»"),
    ],
  },
  {
    id: "reviews", uz: "Fikrlar va savollar", ru: "Отзывы и вопросы",
    fields: [
      f("site.reviewsTitle", "Fikrlar sarlavhasi", "Заголовок отзывов"),
      f("site.reviewsCount", "Fikrlar soni ({count} — son)", "Число отзывов ({count} — число)"),
      f("faq.eyebrow", "Savollar bo'limi nomi", "Название раздела вопросов"),
      f("faq.title", "Savollar sarlavhasi", "Заголовок вопросов"),
    ],
  },
  {
    id: "contact", uz: "Aloqa", ru: "Контакты",
    fields: [
      f("contact.eyebrow", "Bo'lim nomi", "Название раздела"),
      f("contact.title", "Sarlavha", "Заголовок"),
      f("contact.hours", "«Ish vaqti»", "«Часы работы»"),
      f("contact.address", "«Manzil»", "«Адрес»"),
      f("contact.formTitle", "Forma sarlavhasi", "Заголовок формы"),
      f("contact.formLead", "Forma izohi", "Пояснение формы", true),
      f("contact.send", "«Yuborish» tugmasi", "Кнопка «Отправить»"),
      f("contact.sent", "Xabar yuborilgandagi matn", "Текст после отправки", true),
    ],
  },
  {
    id: "booking", uz: "Qabulga yozilish", ru: "Запись на приём",
    fields: [
      f("booking.title", "Sarlavha", "Заголовок"),
      f("booking.lead", "Sarlavha ostidagi matn", "Текст под заголовком"),
      f("booking.serviceOptionalHint", "Xizmat tanlash izohi", "Подсказка выбора услуги", true),
      f("booking.privacy", "Ma'lumotlar haqida izoh", "Примечание о данных", true),
      f("booking.submit", "Tasdiqlash tugmasi", "Кнопка подтверждения"),
      f("booking.successTitle", "Muvaffaqiyat sarlavhasi", "Заголовок успеха"),
      f("booking.successLead", "Muvaffaqiyat matni", "Текст успеха", true),
      f("booking.successChange", "O'zgartirish haqida izoh", "Про изменение записи", true),
      f("booking.noDates", "Bo'sh kun yo'qligi haqida", "Когда нет свободных дней", true),
      f("booking.unavailable", "Yozilish to'xtatilganda", "Когда запись отключена", true),
    ],
  },
  {
    id: "footer", uz: "Sayt pastki qismi", ru: "Подвал сайта",
    fields: [
      f("footer.quickLinks", "«Bo'limlar»", "«Разделы»"),
      f("footer.contact", "«Aloqa»", "«Контакты»"),
      f("footer.privacy", "«Maxfiylik siyosati»", "«Политика конфиденциальности»"),
      f("footer.disclaimer", "Ogohlantirish matni", "Текст предупреждения", true),
      f("footer.rights", "«Barcha huquqlar himoyalangan»", "«Все права защищены»"),
    ],
  },
  {
    id: "privacy", uz: "Maxfiylik siyosati sahifasi", ru: "Страница политики конфиденциальности",
    fields: [
      f("privacyPage.title", "Sarlavha", "Заголовок"),
      f("privacyPage.updated", "Yangilangan sana", "Дата обновления"),
      f("privacyPage.intro", "Kirish matni", "Вступление", true),
      ...[0, 1, 2, 3, 4].flatMap((i) => [
        f(`privacyPage.sections.${i}.title`, `${i + 1}-band sarlavhasi`, `Пункт ${i + 1}: заголовок`),
        f(`privacyPage.sections.${i}.text`, `${i + 1}-band matni`, `Пункт ${i + 1}: текст`, true),
      ]),
    ],
  },
  {
    id: "admin", uz: "Admin panelga kirish", ru: "Вход в админ-панель",
    fields: [
      f("admin.login.title", "Kirish sahifasi sarlavhasi", "Заголовок страницы входа"),
      f("admin.login.lead", "Sarlavha ostidagi matn", "Текст под заголовком"),
      f("admin.login.eyebrow", "Rasm ustidagi kichik yozuv («BOSHQARUV PANELI»)", "Маленькая надпись на картинке («ПАНЕЛЬ УПРАВЛЕНИЯ»)"),
      f("admin.login.tagline", "Rasm ustidagi katta yozuv", "Крупная надпись на картинке", true),
      f("admin.login.submit", "«Kirish» tugmasi", "Кнопка «Войти»"),
      f("admin.welcome.hello", "Kirgandan keyingi salom («Assalomu alaykum»)", "Приветствие после входа («Ассаламу алейкум»)"),
      f("admin.welcome.name", "Salomdagi ism (bo'sh — profildagi ism)", "Имя в приветствии (пусто — из профиля)"),
      f("admin.welcome.cta", "Salomlashuvdagi tugma", "Кнопка в приветствии"),
    ],
  },
];

export const EDITABLE_PATHS = new Set(TEXT_GROUPS.flatMap((g) => g.fields.map((x) => x.path)));
export const MAX_TEXT_LENGTH = 1000;

/** Reads a dotted path ("site.trust.0.title") from a dictionary. */
export function getPath(dict: unknown, path: string): string {
  let cur: unknown = dict;
  for (const key of path.split(".")) {
    if (cur == null || typeof cur !== "object") return "";
    cur = (cur as Record<string, unknown>)[key];
  }
  return typeof cur === "string" ? cur : "";
}

/** Returns a copy of `dict` with the admin's texts laid over it (only known, non-empty string paths). */
export function applyTexts(dict: Dictionary, overrides: Record<string, string> | undefined): Dictionary {
  if (!overrides) return dict;
  const entries = Object.entries(overrides).filter(([path, v]) => EDITABLE_PATHS.has(path) && typeof v === "string" && v.trim());
  if (entries.length === 0) return dict;
  const out = structuredClone(dict) as unknown as Record<string, unknown>;
  for (const [path, value] of entries) {
    const keys = path.split(".");
    let cur: Record<string, unknown> = out;
    for (const key of keys.slice(0, -1)) {
      const next = cur[key];
      if (next == null || typeof next !== "object") {
        cur = {};
        break;
      }
      cur = next as Record<string, unknown>;
    }
    const last = keys[keys.length - 1];
    if (typeof cur[last] === "string") cur[last] = value.trim();
  }
  return out as unknown as Dictionary;
}

/** Narrows the raw JSON column to the expected shape. */
export function parseOverrides(raw: unknown): TextOverrides {
  const out: TextOverrides = {};
  if (!raw || typeof raw !== "object") return out;
  for (const locale of ["uz", "ru"] as const) {
    const m = (raw as Record<string, unknown>)[locale];
    if (m && typeof m === "object") {
      out[locale] = Object.fromEntries(Object.entries(m).filter(([, v]) => typeof v === "string")) as Record<string, string>;
    }
  }
  return out;
}
