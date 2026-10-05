import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getDoctor } from "@/lib/data";
import { getL, getT } from "@/lib/i18n/server";
import { ActionForm, SubmitButton } from "@/components/admin/ActionForm";
import { TextArea, TextField } from "@/components/admin/fields";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { LinesEditor } from "@/components/admin/LinesEditor";
import { PageHeader, Panel } from "@/components/admin/ui";
import { saveProfile } from "@/app/admin/actions/content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.admin.nav.profile };
}

export default async function ProfilePage() {
  const [t, L] = await Promise.all([getT(), getL()]);
  await requireAdmin();
  const d = await getDoctor();
  const p = t.admin.profile;
  return (
    <>
      <PageHeader title={t.admin.nav.profile} description={L("Saytdagi barcha matn va rasmlar shu yerdan boshqariladi.", "Все тексты и изображения сайта редактируются здесь.")} />
      <ActionForm action={saveProfile} className="space-y-6">
        <Panel title={L("Bosh ekran", "Главный экран")}>
          <div className="grid gap-5 md:grid-cols-2">
            <TextField name="fullName" label={L("F.I.Sh.", "Ф.И.О.")} defaultValue={d.fullName} required />
            <TextField name="title" label={L("Mutaxassislik / unvon", "Специальность / звание")} defaultValue={d.title} required />
            <TextField name="heroBadge" label={L("Sarlavha ustidagi belgi (manzil)", "Метка над заголовком (адрес)")} placeholder={L("Masalan: Buxoro, Navoiy ko'chasi 12", "Например: Бухара, ул. Навои 12")} hint={L("Bo'sh qoldirilsa, to'liq manzil chiqadi.", "Если пусто — показывается полный адрес.")} defaultValue={d.heroBadge} />
            <TextField name="heroTitle" label={L("Katta sarlavha", "Большой заголовок")} placeholder="Quloq, burun va tomoq salomatligi" hint={L("Bo'sh qoldirilsa, shu standart sarlavha chiqadi.", "Если пусто — показывается стандартный заголовок.")} defaultValue={d.heroTitle} />
            <TextArea name="shortDescription" label={L("Sarlavha ostidagi matn", "Текст под заголовком")} defaultValue={d.shortDescription} rows={2} className="md:col-span-2" />
            <TextField
              name="instagram"
              label="Instagram username"
              placeholder="@username"
              hint={L("Faqat username yozing (masalan: @dr.zohidullo). Bosh ekrandagi kartani bosganda Instagram ochiladi.", "Укажите только username (например: @dr.zohidullo). По нажатию на карточку на главном экране откроется Instagram.")}
              defaultValue={d.instagram ? `@${d.instagram.replace(/^@/, "")}` : ""}
              className="md:col-span-2"
            />
            <ImageUpload name="photoUrl" label={L("Bosh ekran surati", "Фото главного экрана")} hint={L("Tik (portret) surat yaxshi chiqadi.", "Лучше всего подходит вертикальное (портретное) фото.")} defaultValue={d.photoUrl} aspect="aspect-[4/5]" />
            <ImageUpload name="logoUrl" label={L("Logotip (chap yuqori burchak)", "Логотип (левый верхний угол)")} hint={L("Kvadrat, shaffof fonli PNG tavsiya etiladi. Bo'sh bo'lsa, standart belgi chiqadi.", "Рекомендуется квадратный PNG с прозрачным фоном. Если пусто — стандартный значок.")} defaultValue={d.logoUrl} aspect="aspect-square" fit="contain" />
          </div>
        </Panel>

        <Panel title={L("Davolash yo'nalishlari (bosh sahifadagi kartalar)", "Направления лечения (карточки на главной)")}>
          <LinesEditor
            name="specializations"
            label={L("Yo'nalishlar", "Направления")}
            placeholder={L("Masalan: Quloq kasalliklari", "Например: Quloq kasalliklari")}
            addLabel={L("Yo'nalish qo'shish", "Добавить направление")}
            hint={L("Har bir qator — bitta karta. Belgi nomiga qarab avtomatik tanlanadi (quloq, burun, tomoq, bolalar, endoskopiya…).", "Каждая строка — одна карточка. Иконка подбирается автоматически по названию (ухо, нос, горло, дети, эндоскопия…).")}
            defaultValue={d.specializations}
          />
        </Panel>

        <Panel title={L("\"Shifokor haqida\" sahifasi", "Страница «О враче»")}>
          <div className="grid gap-5 md:grid-cols-2">
            <TextArea name="biography" label={L("Biografiya", "Биография")} hint={L("Har bir xatboshini yangi qatordan yozing.", "Каждый абзац пишите с новой строки.")} defaultValue={d.biography} rows={7} className="md:col-span-2" />
            <ImageUpload name="aboutPhotoUrl" label={L("Sahifa surati", "Фото страницы")} hint={L("Bo'sh qoldirilsa, bosh ekran surati ishlatiladi.", "Если пусто — используется фото главного экрана.")} defaultValue={d.aboutPhotoUrl} aspect="aspect-[4/5]" />
            <div className="space-y-5">
              <TextArea name="professionalHistory" label={L("Kasbiy yo'l", "Профессиональный путь")} hint={p.historyHint} defaultValue={d.professionalHistory} />
              <TextArea name="education" label={L("Ta'lim", "Образование")} hint={p.linesHint} defaultValue={d.education} />
            </div>
            <TextArea name="training" label={L("Malaka oshirish", "Повышение квалификации")} hint={p.linesHint} defaultValue={d.training} />
            <TextArea name="certifications" label={L("Sertifikatlar", "Сертификаты")} hint={p.linesHint} defaultValue={d.certifications} />
            <TextArea name="memberships" label={L("Kasbiy a'zolik", "Членство в организациях")} hint={p.linesHint} defaultValue={d.memberships} />
          </div>
        </Panel>

        <Panel title={L("Ruscha matnlar (RU)", "Тексты на русском (RU)")}>
          <p className="-mt-1 mb-5 text-sm text-muted">
            {L("Sayt rus tilida ochilganda shu matnlar chiqadi. Bo'sh qoldirilgan maydon o'rniga o'zbekcha matn ko'rsatiladi.", "Эти тексты показываются, когда сайт открыт на русском. Если поле пустое — показывается текст на узбекском.")}
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            <TextField name="titleRu" label={L("Mutaxassislik (RU)", "Специальность (RU)")} placeholder="ЛОР-врач (оториноларинголог)" defaultValue={d.titleRu} />
            <TextField name="heroBadgeRu" label={L("Sarlavha ustidagi belgi (RU)", "Метка над заголовком (RU)")} placeholder="Бухара, ул. Навои 12" defaultValue={d.heroBadgeRu} />
            <TextField name="heroTitleRu" label={L("Katta sarlavha (RU)", "Большой заголовок (RU)")} placeholder="Здоровье уха, горла и носа" defaultValue={d.heroTitleRu} />
            <TextField name="clinicNameRu" label={L("Klinika nomi (RU)", "Название клиники (RU)")} defaultValue={d.clinicNameRu} />
            <TextArea name="shortDescriptionRu" label={L("Sarlavha ostidagi matn (RU)", "Текст под заголовком (RU)")} defaultValue={d.shortDescriptionRu} rows={2} className="md:col-span-2" />
            <TextField name="addressRu" label={L("To'liq manzil (RU)", "Полный адрес (RU)")} defaultValue={d.addressRu} className="md:col-span-2" />
            <div className="md:col-span-2">
              <LinesEditor name="specializationsRu" label={L("Davolash yo'nalishlari (RU)", "Направления лечения (RU)")} placeholder="Например: Заболевания уха" addLabel={L("Yo'nalish qo'shish", "Добавить направление")} defaultValue={d.specializationsRu} />
            </div>
            <TextArea name="biographyRu" label={L("Biografiya (RU)", "Биография (RU)")} defaultValue={d.biographyRu} rows={6} className="md:col-span-2" />
            <TextArea name="professionalHistoryRu" label={L("Kasbiy yo'l (RU)", "Профессиональный путь (RU)")} hint={p.historyHint} defaultValue={d.professionalHistoryRu} />
            <TextArea name="educationRu" label={L("Ta'lim (RU)", "Образование (RU)")} hint={p.linesHint} defaultValue={d.educationRu} />
            <TextArea name="trainingRu" label={L("Malaka oshirish (RU)", "Повышение квалификации (RU)")} hint={p.linesHint} defaultValue={d.trainingRu} />
            <TextArea name="certificationsRu" label={L("Sertifikatlar (RU)", "Сертификаты (RU)")} hint={p.linesHint} defaultValue={d.certificationsRu} />
            <TextArea name="membershipsRu" label={L("Kasbiy a'zolik (RU)", "Членство в организациях (RU)")} hint={p.linesHint} defaultValue={d.membershipsRu} />
          </div>
        </Panel>

        <Panel title={p.sections.stats}>
          <p className="-mt-1 mb-5 text-sm text-muted">{p.statsHint}</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <TextField name="yearsExperience" type="number" min={0} label={L("Tajriba (yil)", "Опыт (лет)")} defaultValue={d.yearsExperience ?? ""} />
            <TextField name="patientsTreated" type="number" min={0} label={L("Bemorlar soni", "Количество пациентов")} defaultValue={d.patientsTreated ?? ""} />
            <TextField name="proceduresPerformed" type="number" min={0} label={L("Muolajalar soni", "Количество процедур")} defaultValue={d.proceduresPerformed ?? ""} />
            <TextField name="certificationsCount" type="number" min={0} label={L("Sertifikatlar soni", "Количество сертификатов")} defaultValue={d.certificationsCount ?? ""} />
          </div>
        </Panel>

        <Panel title={p.sections.clinic}>
          <div className="grid gap-5 md:grid-cols-2">
            <TextField name="clinicName" label={L("Klinika nomi", "Название клиники")} defaultValue={d.clinicName} />
            <TextField name="address" label={L("To'liq manzil", "Полный адрес")} defaultValue={d.address} />
            <TextField name="city" label={L("Shahar", "Город")} defaultValue={d.city} />
            <TextField name="country" label={L("Davlat", "Страна")} defaultValue={d.country} />
            <TextField name="phone" type="tel" label={L("Telefon", "Телефон")} defaultValue={d.phone} />
            <TextField name="whatsapp" type="tel" label={L("WhatsApp raqami", "Номер WhatsApp")} defaultValue={d.whatsapp} />
            <TextField name="telegram" label={L("Telegram (@username yoki havola)", "Telegram (@username или ссылка)")} defaultValue={d.telegram} />
            <TextField name="email" type="email" label="Email" defaultValue={d.email} />
            <TextField name="mapQuery" label={L("Xarita uchun manzil yoki koordinata", "Адрес или координаты для карты")} hint={L("Masalan: 41.311081, 69.240562 yoki klinika manzili.", "Например: 41.311081, 69.240562 или адрес клиники.")} defaultValue={d.mapQuery} className="md:col-span-2" />
          </div>
        </Panel>

        <Panel title={p.sections.social}>
          <div className="grid gap-5 md:grid-cols-2">
            <TextField name="facebook" type="url" label="Facebook" placeholder="https://facebook.com/…" defaultValue={d.facebook} />
            <TextField name="youtube" type="url" label="YouTube" placeholder="https://youtube.com/…" defaultValue={d.youtube} />
          </div>
        </Panel>

        <div className="sticky bottom-4 z-10 flex justify-end">
          <SubmitButton className="btn btn-dark shadow-lift">{t.common.save}</SubmitButton>
        </div>
      </ActionForm>
    </>
  );
}
