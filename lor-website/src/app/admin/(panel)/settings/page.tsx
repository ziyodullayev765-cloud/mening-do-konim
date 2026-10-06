import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getL, getT } from "@/lib/i18n/server";
import { db } from "@/lib/db";
import { ensureWebhook, getAccessCode, getBotUsername, telegramConfigured } from "@/lib/telegram";
import { Send } from "lucide-react";
import { getSettings } from "@/lib/slots";
import { ActionForm, SubmitButton } from "@/components/admin/ActionForm";
import { Checkbox, TextArea, TextField } from "@/components/admin/fields";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { PageHeader, Panel } from "@/components/admin/ui";
import { changePassword, regenerateTelegramCode, removeTelegramChat, saveSettings, testTelegram } from "@/app/admin/actions/settings";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.admin.nav.settings };
}

export default async function SettingsPage() {
  const t = await getT();
  const admin = await requireAdmin();
  const s = await getSettings();
  const L = await getL();
  const tgReady = telegramConfigured();
  const [bot, webhookOk, code, chats] = tgReady
    ? await Promise.all([
        getBotUsername(),
        ensureWebhook(),
        getAccessCode(),
        db.telegramChat.findMany({ where: { verified: true }, orderBy: { createdAt: "asc" } }),
      ])
    : [null, false, "", []];
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
          <Panel title={st.appearance}>
            <div className="grid gap-6 sm:grid-cols-2">
              <ImageUpload name="backgroundUrl" label={st.background} hint={st.backgroundHint} defaultValue={s.backgroundUrl} aspect="aspect-[16/9]" />
              <ImageUpload
                name="loginBackgroundUrl"
                label={L("Admin kirish sahifasi foni", "Фон страницы входа в админку")}
                hint={L("Login sahifasining chap qismida ko'rinadi (telefonda — butun fon).", "Показывается слева на странице входа (на телефоне — весь фон).")}
                defaultValue={s.loginBackgroundUrl}
                aspect="aspect-[16/9]"
              />
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

        <div className="space-y-6 self-start xl:col-span-2">
        <Panel title={L("Telegram bildirishnomalar", "Уведомления в Telegram")}>
          {!tgReady ? (
            <p className="text-sm text-muted">{L("Bot tokeni (TELEGRAM_BOT_TOKEN) sozlanmagan.", "Токен бота (TELEGRAM_BOT_TOKEN) не настроен.")}</p>
          ) : (
            <div className="space-y-4 text-sm">
              <p className="text-muted">
                {L("Yangi qabul yoki xabar kelganda bemorning ismi, telefoni va qabul vaqti Telegram'ga yuboriladi.", "При новой записи или сообщении имя, телефон пациента и время приёма отправляются в Telegram.")}
              </p>
              <ol className="list-decimal space-y-1.5 pl-5 text-text">
                <li>
                  {L("Telegram'da botni oching", "Откройте бота в Telegram")}
                  {bot && (
                    <>
                      {": "}
                      <a href={`https://t.me/${bot}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent hover:underline">@{bot}</a>
                    </>
                  )}
                </li>
                <li>{L("/start bosing — bot kirish kodini so'raydi.", "Нажмите /start — бот попросит код доступа.")}</li>
                <li>{L("Quyidagi kodni yuboring.", "Отправьте код ниже.")}</li>
              </ol>
              <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-paper-2/50 px-4 py-3">
                <span className="text-muted">{L("Kirish kodi", "Код доступа")}:</span>
                <span className="font-mono text-xl font-bold tracking-[0.25em] text-ink select-all">{code}</span>
                <ActionForm action={regenerateTelegramCode} className="ml-auto">
                  <SubmitButton className="btn btn-ghost btn-sm">{L("Yangi kod", "Новый код")}</SubmitButton>
                </ActionForm>
              </div>
              {!webhookOk && (
                <p className="rounded-lg border border-warning/30 bg-warning-soft px-3 py-2 text-warning">
                  {L("Bot hali saytga ulanmagan (webhook). Sahifani birozdan keyin yangilang.", "Бот ещё не подключён к сайту (webhook). Обновите страницу чуть позже.")}
                </p>
              )}
              <div>
                <p className="mb-2 font-semibold text-ink">{L("Ulangan chatlar", "Подключённые чаты")}</p>
                {chats.length === 0 ? (
                  <p className="text-muted">{L("Hozircha yo'q.", "Пока нет.")}</p>
                ) : (
                  <ul className="divide-y divide-line rounded-lg border border-line">
                    {chats.map((c) => (
                      <li key={c.id} className="flex items-center justify-between gap-3 px-3 py-2">
                        <span className="min-w-0 truncate font-medium text-ink">{c.name || c.chatId}</span>
                        <ActionForm action={removeTelegramChat}>
                          <input type="hidden" name="id" value={c.id} />
                          <SubmitButton className="btn btn-ghost btn-sm text-danger">{L("Uzish", "Отключить")}</SubmitButton>
                        </ActionForm>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {chats.length > 0 && (
                <ActionForm action={testTelegram}>
                  <SubmitButton className="btn btn-secondary btn-sm"><Send className="size-4" aria-hidden /> {L("Sinov xabari", "Тестовое сообщение")}</SubmitButton>
                </ActionForm>
              )}
            </div>
          )}
        </Panel>
        <Panel title={st.account}>
          <p className="mb-5 text-sm text-muted">{admin.email}</p>
          <ActionForm action={changePassword} resetOnSuccess className="space-y-4">
            <TextField name="currentPassword" type="password" autoComplete="current-password" label={st.currentPassword} required />
            <TextField name="newPassword" type="password" autoComplete="new-password" minLength={10} label={st.newPassword} required />
            <SubmitButton className="btn btn-secondary">{st.changePassword}</SubmitButton>
          </ActionForm>
        </Panel>
        </div>
      </div>
    </>
  );
}
