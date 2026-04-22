import { authApplications, demoCredentialsByApp } from "@ustaca/auth";
import { AuthScreen, SurfaceCard } from "@ustaca/ui";

import { redirectAdminLoginIfAuthenticated } from "@/lib/auth";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const readParam = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const errorMessages = {
  invalid_credentials: "E-posta veya sifre eslesmedi. Bootstrap hesap bilgilerini kontrol edip tekrar dene."
} as const satisfies Record<string, string>;

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams?: SearchParams;
}) {
  await redirectAdminLoginIfAuthenticated();

  const params = searchParams ? await searchParams : undefined;
  const errorKey = readParam(params?.error);
  const errorMessage =
    errorKey && errorKey in errorMessages
      ? errorMessages[errorKey as keyof typeof errorMessages]
      : null;

  return (
    <AuthScreen
      productLabel="Admin Panel"
      title="Operasyon ve yonetim girisi"
      description="Super admin ve operasyon admini ayni uygulamadan girer; role guard ve protected layout tum admin route'larini server tarafinda korur."
      badge="super_admin + ops_admin"
      aside={
        <>
          <ul className="auth-list">
            <li>Tek hesap, tek isletme, tek site mantigina gore operasyon ekranlari ayrilir.</li>
            <li>Customer rolu bu uygulamaya giremez; dogru rol dogru uygulamaya yonlendirilir.</li>
            <li>Oturum cookie'si imzali tutulur ve admin ile panel oturumu birbirinden ayridir.</li>
          </ul>
        </>
      }
    >
      <SurfaceCard
        eyebrow="giris"
        title="Admin hesabinla devam et"
        description="Bootstrap auth katmani sade tutuldu; daha sonra gerçek provider baglanacak sekilde moduler kuruldu."
      >
        {errorMessage ? <p className="form-message form-message--critical">{errorMessage}</p> : null}

        <form className="auth-form" action="/api/auth/login" method="post">
          <div className="form-stack">
            <div className="field">
              <label htmlFor="admin-email">E-posta</label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="operasyon@ustacacozum.com"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="admin-password">Sifre</label>
              <input
                id="admin-password"
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
              Admin paneline gir
            </button>
          </div>
        </form>

        <div className="surface-card__content">
          <p className="stack-note">
            Local bootstrap hesaplari:
          </p>
          <ul className="stack-list">
            {demoCredentialsByApp.admin.map((credential) => (
              <li key={credential.email}>
                <strong>{credential.role}</strong>: {credential.email} / {credential.password}
              </li>
            ))}
          </ul>
          <p className="stack-note">
            Yetkili roller: {authApplications.admin.allowedRoles.join(", ")}
          </p>
        </div>
      </SurfaceCard>
    </AuthScreen>
  );
}
