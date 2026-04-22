import type { ReactNode } from "react";

import { roleLabel } from "@ustaca/auth";
import { AppShell } from "@ustaca/ui";

import { adminSessionSummary, requireAdminSession } from "@/lib/auth";
import { getAdminNavigation } from "@/lib/data";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminSession();
  const sessionMeta = adminSessionSummary(session);
  const navigation = await getAdminNavigation();

  return (
    <AppShell
      productLabel="Admin Panel"
      title="Operasyon merkezi"
      subtitle="Tek kullanici, tek isletme ve tek site kuraliyla calisan Ustaca AI musteri yasam dongusunu buradan yonet."
      nav={navigation}
      actions={
        <div className="button-row">
          <span className="session-pill">
            <span className="session-meta">
              <strong>{sessionMeta.title}</strong>
              <span>
                {roleLabel(session.user.role)} · {session.user.email}
              </span>
            </span>
          </span>
          <a className="button-primary" href="/customers">
            Musteri kayitlari
          </a>
          <a className="button-secondary" href="/trials">
            Trial operasyonu
          </a>
          <form action="/api/auth/logout" method="post">
            <button className="button-ghost" type="submit">
              Cikis yap
            </button>
          </form>
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
