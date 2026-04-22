import { InfoList, SurfaceCard } from "@ustaca/ui";

import { adminRoleGuardrails } from "@/lib/content";

const accessRules = [
  {
    label: "admin.ustaca.app",
    value: "super_admin ve ops_admin",
    hint: "Customer rolu admin paneline giremez, route guard ile engellenir.",
    tone: "accent"
  },
  {
    label: "panel.ustaca.app",
    value: "customer",
    hint: "Musteri sadece kendi hesabini, sitesini ve taleplerini gorur.",
    tone: "positive"
  },
  {
    label: "Tek kullanici kurali",
    value: "Davet ve ikinci hesap yok",
    hint: "Ilk surumde ayni isletme icin ikinci kullanici olusturulmaz.",
    tone: "warning"
  }
] as const;

export default function AccessPage() {
  return (
    <div className="page-stack">
      <div className="two-column">
        <SurfaceCard
          eyebrow="rol gorunurlugu"
          title="Admin panelin yetki matrisi"
          description="Karmasik enterprise RBAC yerine ilk surum ihtiyacina uygun net rol ayrimi korunur."
        >
          <InfoList items={adminRoleGuardrails} />
        </SurfaceCard>

        <SurfaceCard
          eyebrow="route guard"
          title="Uygulama bazli erisim"
          description="Admin ve musteri uygulamalari ayridir; yanlis role yanlis ekran acilmaz."
        >
          <InfoList items={[...accessRules]} />
        </SurfaceCard>
      </div>

      <SurfaceCard
        eyebrow="neden sade?"
        title="Ilk surumde erisim politikasi neden bu kadar net?"
        description="Tek kullanici, tek isletme ve tek site kurali hem auth katmanini hem de operasyon ekranlarini sade tutar."
      >
        <ul className="note-list">
          <li>Super admin sistem duzeyi rol ve finans gorunurlugune sahiptir.</li>
          <li>Ops admin trial, odeme, domain ve destek akisini yonetir ama sistem ayarlarini degistirmez.</li>
          <li>Customer rolu admin panelinde yer almaz; panel ve admin UI tamamen ayridir.</li>
        </ul>
      </SurfaceCard>
    </div>
  );
}
