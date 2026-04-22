import { InfoList, SurfaceCard, TimelineList } from "@ustaca/ui";

import { requireCustomerSession } from "@/lib/auth";
import {
  buildDomainInfo,
  buildDomainTimeline,
  getCustomerWorkspaceForSession
} from "@/lib/data";

export default async function DomainPage() {
  const session = await requireCustomerSession();
  const workspace = await getCustomerWorkspaceForSession(session);
  const domainInfo = buildDomainInfo(workspace);
  const domainTimeline = buildDomainTimeline(workspace);

  return (
    <div className="page-stack">
      <div className="two-column">
        <SurfaceCard
          eyebrow="domain durumu"
          title="Yayin adresinin nereye geldigi"
          description="Teknik detayla ugrasmazsin; sadece hangi asamada oldugunu ve siranin ne oldugunu gorursun."
        >
          <InfoList items={domainInfo} />
        </SurfaceCard>

        <SurfaceCard
          eyebrow="akis"
          title="Domain sureci nasil ilerliyor?"
          description="Kapali ve kontrollu yapida domain gecisi operasyon ekibi tarafindan tamamlanir."
        >
          <TimelineList items={domainTimeline} />
        </SurfaceCard>
      </div>
    </div>
  );
}
