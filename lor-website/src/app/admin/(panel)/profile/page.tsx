import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getDoctor } from "@/lib/data";
import { t } from "@/lib/i18n";
import { ActionForm, SubmitButton } from "@/components/admin/ActionForm";
import { TextArea, TextField } from "@/components/admin/fields";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { PageHeader, Panel } from "@/components/admin/ui";
import { saveProfile } from "@/app/admin/actions/content";

export const metadata: Metadata = { title: t.admin.nav.profile };

export default async function ProfilePage() {
  await requireAdmin();
  const d = await getDoctor();
  const p = t.admin.profile;
  return (
    <>
      <PageHeader title={t.admin.nav.profile} />
      <ActionForm action={saveProfile} className="space-y-6">
        <Panel title={p.sections.main}>
          <div className="grid gap-5 md:grid-cols-2">
            <TextField name="fullName" label="F.I.Sh." defaultValue={d.fullName} required />
            <TextField name="title" label="Mutaxassislik / unvon" defaultValue={d.title} required />
            <TextArea name="shortDescription" label="Qisqa tavsif (bosh sahifa)" defaultValue={d.shortDescription} rows={2} className="md:col-span-2" />
            <TextArea name="biography" label="Biografiya" hint="Har bir xatboshini yangi qatordan yozing." defaultValue={d.biography} rows={6} className="md:col-span-2" />
            <TextField name="heroTitle" label="Bosh ekran sarlavhasi" placeholder="Quloq, burun va tomoq salomatligi" hint="Bo'sh qoldirilsa, shu standart sarlavha chiqadi." defaultValue={d.heroTitle} className="md:col-span-2" />
            <ImageUpload
              name="photoUrl"
              label="1-surat: bosh ekran (Qabulga yozilish tugmasi yonida)"
              hint="Kompyuterdan tanlang yoki sudrab tashlang. Tik (portret) surat yaxshi chiqadi."
              defaultValue={d.photoUrl}
              aspect="aspect-[4/5]"
            />
            <ImageUpload
              name="aboutPhotoUrl"
              label={"2-surat: \"Shifokor haqida\" bo'limi"}
              hint="Bo'sh qoldirilsa, 1-surat ishlatiladi."
              defaultValue={d.aboutPhotoUrl}
              aspect="aspect-[4/5]"
            />
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

        <Panel title={p.sections.background}>
          <div className="grid gap-5 md:grid-cols-2">
            <TextArea name="specializations" label="Asosiy yo'nalishlar" hint={p.linesHint} defaultValue={d.specializations} />
            <TextArea name="education" label="Ta'lim" hint={p.linesHint} defaultValue={d.education} />
            <TextArea name="training" label="Malaka oshirish" hint={p.linesHint} defaultValue={d.training} />
            <TextArea name="professionalHistory" label="Kasbiy yo'l" hint={p.historyHint} defaultValue={d.professionalHistory} />
            <TextArea name="certifications" label="Sertifikatlar" hint={p.linesHint} defaultValue={d.certifications} />
            <TextArea name="memberships" label="Kasbiy a'zolik" hint={p.linesHint} defaultValue={d.memberships} />
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
          <div className="grid gap-5 md:grid-cols-3">
            <TextField name="instagram" type="url" label="Instagram" placeholder="https://instagram.com/…" defaultValue={d.instagram} />
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
