# Ustaca AI Monorepo

Ustaca AI için monorepo tabanlı SaaS iskeleti.

## Kapsam

- `apps/web`: Pazarlama ve dönüşüm yüzeyi
- `apps/admin`: Müşteri, deneme, ödeme, alan adı ve destek operasyon paneli
- `apps/panel`: Tek kullanıcı, tek işletme ve tek site mantığına göre müşteri paneli
- `packages/ui`: Ortak tasarım sistemi ve arayüz bileşenleri
- `packages/domain`: Kimlik, durum, ürün, ödeme, alan adı ve destek veri modelleri
- `packages/auth`: Rol ve izin matrisi
- `packages/db`: Firestore koleksiyon sözleşmeleri ve repository arayüzleri
- `packages/lib`: Slug, lifecycle ve audit yardımcıları
- `packages/ai`: Blueprint, tema ailesi ve üretim pipeline sözlükleri
- `packages/email`: Bildirim olayları ve e-posta şablonları
- `infra`: Google Cloud ve Terraform modül ve ortam iskeleti
- `docs`: Hukuk, operasyon, runbook ve rapor şablonları

## Repo yapısı

```text
apps/
  web/
  admin/
  panel/
packages/
  ui/
  domain/
  auth/
  db/
  lib/
  ai/
  email/
  config/
  types/
infra/
  modules/
  envs/
docs/
```

## Başlangıç

```bash
npm install
npm run dev:web
npm run dev:panel
npm run dev:admin
```

Uygulamalar Next.js App Router üzerinden ayrık çalışır:

- `web`: `http://localhost:3000`
- `panel`: `http://localhost:3001`
- `admin`: `http://localhost:3002`

## Paylaşılan ilkeler

- Tek kullanıcı = tek işletme = tek site
- Deneme süresi 7 gün ve gerçek ürün mantığında
- Tam aktivasyon ödeme sonrasında açılır
- Gecikmede yayın askıya alınabilir
- Dışarıdan alan adı kabul edilmez
- Firestore odaklı veri katmanı ve Cloud Run odaklı dağıtım hedefi
- Global external Application Load Balancer ve serverless NEG hedefi

## Kepenk politika pilotu

Bu depo, Kepenk’in founding-team pilotlarından biridir. Depoya özel politika, beklenen kararlar ve offline kanıt manifesti [`.kepenk/`](.kepenk/README.md) altında tutulur.

[`Kepenk policy`](.github/workflows/kepenk-policy.yml) workflow’u doğrulanmış `v0.4.0` sürümünü kullanarak:

- politika dosyasını doğrular;
- sekiz vakalık deklaratif politika test paketini çalıştırır;
- `.kepenk/adoption.json` dosyasını telemetri ve URL isteği olmadan doğrular;
- repository bağlamını `${{ github.repository }}` üzerinden açıkça verir;
- rutin lint işleminin `allow` kararı aldığını;
- bağımlılık değişikliğinin `approval` kararı aldığını;
- açık paket yayınının `deny` kararı aldığını;
- sonuç alanları ile workflow sonuçlarının birbiriyle uyumlu olduğunu kontrol eder.

Policy kuralları `bilgi-ship-it/ustaca-ai` repository bağlamına sınırlandırılmıştır. Bağlam eksik veya farklı olduğunda bu kurallar eşleşmez ve muhafazakâr `approval` varsayımı uygulanır.

Bu npm/Turborepo deposunda Python proje metadata’sı bulunmaz. Böylece pilot v0.2.1 non-Python taşınabilirliğini, v0.3 repository bağlamı ve politika testlerini, ayrıca v0.4 offline adopter kanıtını gerçek tüketici workflow’unda doğrular.

Manifestin geçerli olması repository sahipliğini, kimliği, üretim güvenliğini, tüm eylemlerin Kepenk’ten geçtiğini veya bağımsız benimsenmeyi kanıtlamaz. Bu pilot bağımsız benimsenme olarak sayılmaz; Kepenk kurucu ekibi tarafından yönetilen açık bir entegrasyon örneğidir.

## Dokümanlar

Belge seti için başlangıç noktası: [`docs/README.md`](docs/README.md)

Ana kaynak belge: [`docs/nihai_ana_master_belge_ustaca_ai.md`](docs/nihai_ana_master_belge_ustaca_ai.md)
