"use client";

import { AlertTriangle, EyeOff, Trash2 } from "lucide-react";
import { useI18n } from "@/components/site/I18nProvider";
import { Modal } from "../Modal";
import type { ServiceRow } from "./types";


export function DeleteServiceDialog({
  service,
  onCancel,
  onConfirm,
  onHideInstead,
}: {
  service: ServiceRow | null;
  onCancel: () => void;
  onConfirm: (service: ServiceRow) => void;
  onHideInstead: (service: ServiceRow) => void;
}) {
  const { t } = useI18n();
  const ui = t.admin.servicesUi;
  return (
    <Modal
      open={service !== null}
      onRequestClose={onCancel}
      size="sm"
      title={ui.deleteTitle}
      footer={
        service && (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>{t.common.cancel}</button>
            <button type="button" className="btn btn-danger" onClick={() => onConfirm(service)}>
              <Trash2 className="size-4" aria-hidden /> {ui.deleteConfirm}
            </button>
          </div>
        )
      }
    >
      {service && (
        <div className="space-y-4 text-[15px] leading-relaxed">
          <p className="text-ink">{ui.deleteLead.replace("{name}", service.name)}</p>
          {service.upcomingCount > 0 && (
            <p className="flex gap-3 rounded-lg border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {ui.deleteUpcoming.replace("{count}", String(service.upcomingCount))}
            </p>
          )}
          {service.active && (
            <div className="flex flex-col gap-3 rounded-lg border border-line bg-paper-2/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">{ui.deleteSuggestHide}</p>
              <button type="button" className="btn btn-secondary btn-sm shrink-0" onClick={() => onHideInstead(service)}>
                <EyeOff className="size-4" aria-hidden /> {ui.hideInstead}
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
