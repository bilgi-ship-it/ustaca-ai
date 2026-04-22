import { AuthScreen, SurfaceCard } from "@ustaca/ui";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const readParam = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const reasonMessages = {
  unauthorized_role:
    "Bu uygulama yalnizca super_admin ve ops_admin rolleri icindir. Customer hesabi ile admin paneline giris yapilamaz."
} as const satisfies Record<string, string>;

export default async function AdminUnauthorizedPage({
  searchParams
}: {
  searchParams?: SearchParams;
}) {
  const params = searchParams ? await searchParams : undefined;
  const reason = readParam(params?.reason);
  const message =
    (reason && reason in reasonMessages
      ? reasonMessages[reason as keyof typeof reasonMessages]
      : null) ||
    "Rolun bu admin alanina erismeye uygun degil. Dogru uygulama ve dogru hesapla tekrar deneyebilirsin.";

  return (
    <AuthScreen
      productLabel="Admin Panel"
      title="Bu alan rolune acik degil"
      description="RBAC katmani yanlis rolu server tarafinda durdurdu. Admin uygulamasina yalnizca operasyon ve sistem rollerinin girmesine izin verilir."
      badge="unauthorized"
      aside={
        <ul className="auth-list">
          <li>super_admin: sistem, finans ve rol ayarlari</li>
          <li>ops_admin: trial, odeme, domain ve destek operasyonu</li>
          <li>customer: yalnizca kendi paneli ve kendi verisi</li>
        </ul>
      }
    >
      <SurfaceCard
        eyebrow="erisim reddedildi"
        title="Yetki siniri korundu"
        description="Yanlis role yanlis ekran acilmamasi bu surumun ana kabul kriterlerinden biri."
      >
        <p className="form-message form-message--critical">{message}</p>

        <div className="button-row">
          <a className="button-primary" href="/login">
            Admin girisine don
          </a>
        </div>
      </SurfaceCard>
    </AuthScreen>
  );
}
