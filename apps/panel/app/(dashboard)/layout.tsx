import type { ReactNode } from "react";

import { roleLabel } from "@ustaca/auth";
import { AppShell } from "@ustaca/ui";

import { panelSessionSummary, requireCustomerSession } from "@/lib/auth";
import { buildPanelNavigation, getCustomerWorkspaceForSession } from "@/lib/data";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireCustomerSession();
  const sessionMeta = panelSessionSummary(session);
  const workspace = await getCustomerWorkspaceForSession(session);
  const navigation = buildPanelNavigation(workspace);

  return (
    <AppShell
      productLabel="Musteri Paneli"
      title="Siteni rahatca yonet"
      subtitle="Metinlerini, hizmetlerini ve gelen talepleri tek ekrandan guncelle. Teknik altyapi ve yayin guvenli bicimde korunur."
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
          <a className="button-primary" href="/site">
            Site bilgileri
          </a>
          <a className="button-secondary" href="/billing">
            Odeme durumu
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
