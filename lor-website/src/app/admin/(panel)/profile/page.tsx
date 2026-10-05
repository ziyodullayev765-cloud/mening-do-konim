import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getDoctor } from "@/lib/data";
import { t } from "@/lib/i18n";
import { ActionForm, SubmitButton } from "@/components/admin/ActionForm";
import { TextArea, TextField } from "@/components/admin/fields";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { LinesEditor } from "@/components/admin/LinesEditor";
import { PageHeader, Panel } from "@/components/admin/ui";
import { saveProfile } from "@/app/admin/actions/content";

export const metadata: Metadata = { title: t.admin.nav.profile };

export default async function ProfilePage() {
  await requireAdmin();
  const d = await getDoctor();
  const p = t.admin.profile;
  return (
    <>
      <PageHeader title={t.admin.nav.profile} description="Saytdagi barcha matn va rasmlar shu yerdan boshqariladi." />
      <ActionForm action={saveProfile} className="space-y-6">
        <Panel title="Bosh ekran">
          <div className="grid gap-5 md:grid-cols-2">
            <TextField name="fullName" label="F.I.Sh." defaultValue={d.fullName} required />
            <TextField name="title" label="Mutaxassislik / unvon" defaultValue={d.title} required />
            <TextField name="heroBadge" label="Sarlavha ustidagi belgi (manzil)" placeholder="Masalan: Buxoro, Navoiy ko'chasi 12" hint="Bo'sh qoldirilsa, to'liq manzil chiqadi." defaultValue={d.heroBadge} />
            <TextField name="heroTitle" label="Katta sarlavha" placeholder="Quloq, burun va tomoq salomatligi" hint="Bo'sh qoldirilsa, shu standart sarlavha chiqadi." defaultValue={d.heroTitle} />
            <TextArea name="shortDescription" label="Sarlavha ostidagi matn" defaultValue={d.shortDescription} rows={2} className="md:col-span-2" />
            <TextField
              name="instagram"
              label="Instagram username"
              placeholder="@username"
              hint="Faqat username yozing (masalan: @dr.zohidullo). Bosh ekrandagi kartani bosganda Instagram ochiladi."
              defaultValue={d.instagram ? `@${d.instagram.replace(/^@/, "")}` : ""}
              className="md:col-span-2"
            />
            <ImageUpload name="photoUrl" label="Bosh ekran surati" hint="Tik (portret) surat yaxshi chiqadi." defaultValue={d.photoUrl} aspect="aspect-[4/5]" />
            <ImageUpload name="logoUrl" label="Logotip (chap yuqori burchak)" hint="Kvadrat, shaffof fonli PNG tavsiya etiladi. Bo'sh bo'lsa, standart belgi chiqadi." defaultValue={d.logoUrl} aspect="aspect-square" fit="contain" />
          </div>
        </Panel>

        <Panel title="Davolash yo'nalishlari (bosh sahifadagi kartalar)">
          <LinesEditor
            name="specializations"
            label="Yo'nalishlar"
            placeholder="Masalan: Quloq kasalliklari"
            addLabel="Yo'nalish qo'shish"
            hint="Har bir qator — bitta karta. Belgi nomiga qarab avtomatik tanlanadi (quloq, burun, tomoq, bolalar, endoskopiya…)."
            defaultValue={d.specializations}
          />
        </Panel>

        <Panel title={"\"Shifokor haqida\" sahifasi"}>
          <div className="grid gap-5 md:grid-cols-2">
            <TextArea name="biography" label="Biografiya" hint="Har bir xatboshini yangi qatordan yozing." defaultValue={d.biography} rows={7} className="md:col-span-2" />
            <ImageUpload name="aboutPhotoUrl" label="Sahifa surati" hint="Bo'sh qoldirilsa, bosh ekran surati ishlatiladi." defaultValue={d.aboutPhotoUrl} aspect="aspect-[4/5]" />
            <div className="space-y-5">
              <TextArea name="professionalHistory" label="Kasbiy yo'l" hint={p.historyHint} defaultValue={d.professionalHistory} />
              <TextArea name="education" label="Ta'lim" hint={p.linesHint} defaultValue={d.education} />
            </div>
            <TextArea name="training" label="Malaka oshirish" hint={p.linesHint} defaultValue={d.training} />
            <TextArea name="certifications" label="Sertifikatlar" hint={p.linesHint} defaultValue={d.certifications} />
            <TextArea name="memberships" label="Kasbiy a'zolik" hint={p.linesHint} defaultValue={d.memberships} />
          </div>
        </Panel>

        <Panel title="Ruscha matnlar (RU)">
          <p className="-mt-1 mb-5 text-sm text-muted">
            Sayt rus tilida ochilganda shu matnlar chiqadi. Bo&apos;sh qoldirilgan maydon o&apos;rniga o&apos;zbekcha matn ko&apos;rsatiladi.
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            <TextField name="titleRu" label="Mutaxassislik (RU)" placeholder="ЛОР-врач (оториноларинголог)" defaultValue={d.titleRu} />
            <TextField name="heroBadgeRu" label="Sarlavha ustidagi belgi (RU)" placeholder="Бухара, ул. Навои 12" defaultValue={d.heroBadgeRu} />
            <TextField name="heroTitleRu" label="Katta sarlavha (RU)" placeholder="Здоровье уха, горла и носа" defaultValue={d.heroTitleRu} />
            <TextField name="clinicNameRu" label="Klinika nomi (RU)" defaultValue={d.clinicNameRu} />
            <TextArea name="shortDescriptionRu" label="Sarlavha ostidagi matn (RU)" defaultValue={d.shortDescriptionRu} rows={2} className="md:col-span-2" />
            <TextField name="addressRu" label="To'liq manzil (RU)" defaultValue={d.addressRu} className="md:col-span-2" />
            <div className="md:col-span-2">
              <LinesEditor name="specializationsRu" label="Davolash yo'nalishlari (RU)" placeholder="Например: Заболевания уха" addLabel="Yo'nalish qo'shish" defaultValue={d.specializationsRu} />
            </div>
            <TextArea name="biographyRu" label="Biografiya (RU)" defaultValue={d.biographyRu} rows={6} className="md:col-span-2" />
            <TextArea name="professionalHistoryRu" label="Kasbiy yo'l (RU)" hint={p.historyHint} defaultValue={d.professionalHistoryRu} />
            <TextArea name="educationRu" label="Ta'lim (RU)" hint={p.linesHint} defaultValue={d.educationRu} />
            <TextArea name="trainingRu" label="Malaka oshirish (RU)" hint={p.linesHint} defaultValue={d.trainingRu} />
            <TextArea name="certificationsRu" label="Sertifikatlar (RU)" hint={p.linesHint} defaultValue={d.certificationsRu} />
            <TextArea name="membershipsRu" label="Kasbiy a'zolik (RU)" hint={p.linesHint} defaultValue={d.membershipsRu} />
          </div>
        </Panel>

        <Panel title={p.sections.stats}>
          <p className="-mt-1 mb-5 text-sm text-muted">{p.statsHint}</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <TextField name="yearsExperience" type="number" min={0} label="Tajriba (yil)" defaultValue={d.yearsExperience ?? ""} />
            <TextField name="patientsTreated" type="number" min={0} label="Bemorlar soni" defaultValue={d.patientsTreated ?? ""} />
            <TextField name="proceduresPerformed" type="number" min={0} label="Muolajalar soni" defaultValue={d.proceduresPerformed ?? ""} />
            <TextField name="certificationsCount" type="number" min={0} label="Sertifikatlar soni" defaultValue={d.certificationsCount ?? ""} />
          </div>
        </Panel>

        <Panel title={p.sections.clinic}>
          <div className="grid gap-5 md:grid-cols-2">
            <TextField name="clinicName" label="Klinika nomi" defaultValue={d.clinicName} />
            <TextField name="address" label="To'liq manzil" defaultValue={d.address} />
            <TextField name="city" label="Shahar" defaultValue={d.city} />
            <TextField name="country" label="Davlat" defaultValue={d.country} />
            <TextField name="phone" type="tel" label="Telefon" defaultValue={d.phone} />
            <TextField name="whatsapp" type="tel" label="WhatsApp raqami" defaultValue={d.whatsapp} />
            <TextField name="telegram" label="Telegram (@username yoki havola)" defaultValue={d.telegram} />
            <TextField name="email" type="email" label="Email" defaultValue={d.email} />
            <TextField name="mapQuery" label="Xarita uchun manzil yoki koordinata" hint="Masalan: 41.311081, 69.240562 yoki klinika manzili." defaultValue={d.mapQuery} className="md:col-span-2" />
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
