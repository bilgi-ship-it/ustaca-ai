import { DataTable, InfoList, StatusBadge, SurfaceCard } from "@ustaca/ui";

import { createSupportTicketAction } from "@/lib/actions";
import { requireCustomerSession } from "@/lib/auth";
import { resolvePanelFeedback } from "@/lib/feedback";
import { buildSupportRows, getCustomerWorkspaceForSession } from "@/lib/data";
import { supportChannels } from "@/lib/content";

export default async function SupportPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireCustomerSession();
  const workspace = await getCustomerWorkspaceForSession(session);
  const feedback = await resolvePanelFeedback(searchParams, {
    saved: {
      support_saved: "Destek talebin olusturuldu. Ekip kaydi panelden takip edecek."
    },
    error: {
      support_invalid: "Destek talebi alanlarini tekrar kontrol et.",
      save_failed: "Destek talebi olusturulurken bir sorun oldu. Birazdan tekrar deneyebilirsin."
    }
  });
  const supportRows = buildSupportRows(workspace);
  const latestTicket = workspace.supportTickets[0];

  return (
    <div className="page-stack">
      {feedback ? (
        <p className={feedback.tone === "critical" ? "form-message form-message--critical" : "form-message"}>
          {feedback.message}
        </p>
      ) : null}

      <div className="two-column">
        <SurfaceCard
          eyebrow="yeni destek"
          title="Kisa bir destek talebi ac"
          description="Sorununu teknik dille anlatmak zorunda degilsin. Kisa bir ozet ve oncelik secmen yeterli."
        >
          <form action={createSupportTicketAction} className="form-stack">
            <div className="field">
              <label htmlFor="supportCategory">Konu basligi</label>
              <select
                defaultValue={latestTicket?.category ?? "site guncelleme"}
                id="supportCategory"
                name="supportCategory"
              >
                <option value="site guncelleme">Site guncelleme</option>
                <option value="domain sureci">Domain sureci</option>
                <option value="odeme sorusu">Odeme sorusu</option>
                <option value="icerik duzeltme">Icerik duzeltme</option>
                <option value="diger">Diger</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="supportPriority">Oncelik</label>
              <select
                defaultValue={latestTicket?.priority ?? "medium"}
                id="supportPriority"
                name="supportPriority"
              >
                <option value="low">Normal</option>
                <option value="medium">Bugun bakilsin</option>
                <option value="high">Acil</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="supportSubject">Kisa konu satiri</label>
              <input
                defaultValue={latestTicket?.subject ?? ""}
                id="supportSubject"
                name="supportSubject"
              />
            </div>

            <div className="field">
              <label htmlFor="supportMessage">Aciklama</label>
              <textarea
                defaultValue={latestTicket?.customerNote ?? ""}
                id="supportMessage"
                name="supportMessage"
                placeholder="Ornek: Ana sayfadaki fiyat kartini guncellemek istiyorum."
                rows={5}
              />
            </div>

            <div className="button-row">
              <button className="button-primary" type="submit">
                Destek talebi gonder
              </button>
              <button className="button-secondary" type="reset">
                Once taslak olarak sakla
              </button>
            </div>
          </form>
        </SurfaceCard>

        <SurfaceCard
          eyebrow="kanallar"
          title="Nereden yardim alabilirsin?"
          description="Panel ici talep ana kanalindir; hizli konular icin diger yardim yollarini da burada gorursun."
        >
          <InfoList items={supportChannels} />
        </SurfaceCard>
      </div>

      <SurfaceCard
        eyebrow="destek kayitlari"
        title="Mevcut destek konularini takip et"
        description="Acik konularin son durumunu tek listede gorur, gerekirse ayni kayda ek bilgi verirsin."
      >
        <DataTable
          caption="Mevcut destek kayitlari"
          columns={[
            {
              key: "subject",
              header: "Konu",
              render: (row) => (
                <div className="cell-stack">
                  <strong>{row.subject}</strong>
                  <span className="cell-muted">{row.category}</span>
                </div>
              )
            },
            {
              key: "channel",
              header: "Kanal",
              render: (row) => <span>{row.channelLabel}</span>
            },
            {
              key: "summary",
              header: "Ozet",
              render: (row) => <span>{row.summary}</span>
            },
            {
              key: "status",
              header: "Durum",
              render: (row) => <StatusBadge label={row.statusLabel} tone={row.statusTone} />
            },
            {
              key: "updated",
              header: "Guncellendi",
              render: (row) => <span>{row.updatedAt}</span>
            }
          ]}
          rows={supportRows}
        />
      </SurfaceCard>
    </div>
  );
}
