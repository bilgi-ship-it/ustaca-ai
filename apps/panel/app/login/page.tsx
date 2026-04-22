import { authApplications, demoCredentialsByApp } from "@ustaca/auth";
import { AuthScreen, SurfaceCard } from "@ustaca/ui";

import { redirectPanelLoginIfAuthenticated } from "@/lib/auth";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const readParam = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const errorMessages = {
  invalid_credentials: "Musteri hesabi bulunamadi veya sifre eslesmedi. Dogru panel girisini kullandigindan emin ol."
} as const satisfies Record<string, string>;

export default async function PanelLoginPage({
  searchParams
}: {
  searchParams?: SearchParams;
}) {
  await redirectPanelLoginIfAuthenticated();

  const params = searchParams ? await searchParams : undefined;
  const errorKey = readParam(params?.error);
  const errorMessage =
    errorKey && errorKey in errorMessages
      ? errorMessages[errorKey as keyof typeof errorMessages]
      : null;

  return (
    <AuthScreen
      productLabel="Musteri Paneli"
      title="Tek isletme paneline giris"
      description="Customer oturumu yalnizca kendi isletmesini ve tek sitesini gorur; admin rolleri bu uygulamaya giremez."
      badge="customer only"
      aside={
        <ul className="auth-list">
          <li>Tek uyelik = tek kullanici = tek isletme = tek site kurali korunur.</li>
          <li>Panel yalnizca icerik, odeme, domain ve talep akislari icin acilir.</li>
          <li>Route guard, oturumsuz ve yanlis rol isteklerini login veya unauthorized ekranina tasir.</li>
        </ul>
      }
    >
      <SurfaceCard
        eyebrow="giris"
        title="Musteri hesabinla devam et"
        description="Sade auth akisi ile sadece dogru customer hesabi iceri alinır; admin rolleri panel uygulamasina dusmez."
      >
        {errorMessage ? <p className="form-message form-message--critical">{errorMessage}</p> : null}

        <form className="auth-form" action="/api/auth/login" method="post">
          <div className="form-stack">
            <div className="field">
              <label htmlFor="panel-email">E-posta</label>
              <input
                id="panel-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="merve@isiktemizlik.com"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="panel-password">Sifre</label>
              <input
                id="panel-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Guvenli sifreni gir"
                required
              />
            </div>
          </div>

          <div className="button-row">
            <button className="button-primary" type="submit">
              Musteri paneline gir
            </button>
          </div>
        </form>

        <div className="surface-card__content">
          <p className="stack-note">Local bootstrap hesabi:</p>
          <ul className="stack-list">
            {demoCredentialsByApp.panel.map((credential) => (
              <li key={credential.email}>
                <strong>{credential.role}</strong>: {credential.email} / {credential.password}
              </li>
            ))}
          </ul>
          <p className="stack-note">
            Yetkili roller: {authApplications.panel.allowedRoles.join(", ")}
          </p>
        </div>
      </SurfaceCard>
    </AuthScreen>
  );
}
