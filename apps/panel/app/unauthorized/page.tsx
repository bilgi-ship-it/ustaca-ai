import { AuthScreen, SurfaceCard } from "@ustaca/ui";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const readParam = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const reasonMessages = {
  unauthorized_role:
    "Bu uygulama yalnizca customer rolu icindir. Admin hesaplari musteri paneline erisemez."
} as const satisfies Record<string, string>;

export default async function PanelUnauthorizedPage({
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
    "Rolun bu panel alanina uygun degil. Tek kullanicili musteri paneli sadece customer hesabi ile acilir.";

  return (
    <AuthScreen
      productLabel="Musteri Paneli"
      title="Bu alan sadece musteri hesabina acik"
      description="Tek kullanicili panel akisi korundu. Yanlis rol istekleri login veya unauthorized ekranina ayriliyor."
      badge="customer only"
      aside={
        <ul className="auth-list">
          <li>Musteri yalnizca kendi hesabini, kendi sitesini ve kendi odeme/domain verisini gorur.</li>
          <li>Coklu kullanici ve coklu sube ilk surumde kapali tutulur.</li>
        </ul>
      }
    >
      <SurfaceCard
        eyebrow="erisim reddedildi"
        title="Rol korumasi aktif"
        description="Admin ve customer oturumlari birbirinden ayrildigi icin panelde sadece dogru rol kalir."
      >
        <p className="form-message form-message--critical">{message}</p>

        <div className="button-row">
          <a className="button-primary" href="/login">
            Musteri girisine don
          </a>
        </div>
      </SurfaceCard>
    </AuthScreen>
  );
}
