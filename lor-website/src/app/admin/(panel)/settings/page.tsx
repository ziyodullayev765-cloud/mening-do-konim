import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { getSettings } from "@/lib/slots";
import { ActionForm, SubmitButton } from "@/components/admin/ActionForm";
import { Checkbox, TextArea, TextField } from "@/components/admin/fields";
import { PageHeader, Panel } from "@/components/admin/ui";
import { changePassword, saveSettings } from "@/app/admin/actions/settings";

export const metadata: Metadata = { title: t.admin.nav.settings };

export default async function SettingsPage() {
  const admin = await requireAdmin();
  const s = await getSettings();
  const st = t.admin.settings;
  return (
    <>
      <PageHeader title={t.admin.nav.settings} />
      <div className="grid gap-6 xl:grid-cols-5">
        <ActionForm action={saveSettings} className="space-y-6 xl:col-span-3">
          <Panel title={st.booking}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Checkbox name="bookingEnabled" label={st.bookingEnabled} defaultChecked={s.bookingEnabled} className="sm:col-span-2" />
              <TextField name="slotMinutes" type="number" min={5} max={240} label={st.slotMinutes} defaultValue={s.slotMinutes} />
              <TextField name="bookingWindowDays" type="number" min={1} max={365} label={st.bookingWindowDays} defaultValue={s.bookingWindowDays} />
              <TextField name="minNoticeMinutes" type="number" min={0} label={st.minNoticeMinutes} defaultValue={s.minNoticeMinutes} />
              <TextField name="timezone" label={st.timezone} defaultValue={s.timezone} hint="Masalan: Asia/Tashkent" />
            </div>
          </Panel>
          <Panel title={st.seo}>
            <div className="grid gap-5">
              <TextField name="siteTitle" label={st.siteTitle} defaultValue={s.siteTitle} hint="Bo'sh qoldirilsa: shifokor ismi va mutaxassisligi." />
              <TextArea name="metaDescription" label={st.metaDescription} defaultValue={s.metaDescription} rows={3} />
            </div>
          </Panel>
          <div className="flex justify-end"><SubmitButton>{t.common.save}</SubmitButton></div>
        </ActionForm>

        <Panel title={st.account} className="self-start xl:col-span-2">
          <p className="mb-5 text-sm text-muted">{admin.email}</p>
          <ActionForm action={changePassword} resetOnSuccess className="space-y-4">
            <TextField name="currentPassword" type="password" autoComplete="current-password" label={st.currentPassword} required />
            <TextField name="newPassword" type="password" autoComplete="new-password" minLength={10} label={st.newPassword} required />
            <SubmitButton className="btn btn-secondary">{st.changePassword}</SubmitButton>
          </ActionForm>
        </Panel>
      </div>
    </>
  );
}
