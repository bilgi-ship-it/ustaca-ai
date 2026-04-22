# Ustaca AI Monorepo

Ustaca AI icin monorepo tabanli SaaS iskeleti.

## Kapsam

- `apps/web`: Koyu neon startup estetiginde pazarlama ve donusum yuzeyi
- `apps/admin`: Musteri, trial, odeme, domain ve destek operasyon paneli
- `apps/panel`: Tek kullanici, tek isletme, tek site mantigina gore musteri paneli
- `packages/ui`: Ortak tasarim sistemi, kartlar, badge ve shell bilesenleri
- `packages/domain`: Auth, durum, urun, odeme, domain ve destek veri modelleri
- `packages/auth`: Rol ve izin matrisi
- `packages/db`: Firestore koleksiyon sozlesmeleri ve repository interface'leri
- `packages/lib`: Slug, lifecycle ve audit yardimcilari
- `packages/ai`: Blueprint, tema ailesi ve generation pipeline sozlukleri
- `packages/email`: Bildirim olaylari ve e-posta template sozlukleri
- `infra`: Google Cloud ve Terraform modul/env iskeleti
- `docs`: Hukuk, operasyon, runbook ve rapor sablonlari

## Repo Yapisi

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

## Baslangic

```bash
npm install
npm run dev:web
npm run dev:panel
npm run dev:admin
```

Tum uygulamalar Next.js app router uzerinden ayrik calisir:

- `web`: `http://localhost:3000`
- `panel`: `http://localhost:3001`
- `admin`: `http://localhost:3002`

## Paylasilan Ilkeler

- Tek kullanici = tek isletme = tek site
- Trial 7 gun ve gercek urun mantiginda
- Tam aktivasyon odeme sonrasi acilir
- Gecikmede yayin askiya alinabilir
- Disaridan domain kabul edilmez
- Firestore odakli veri katmani, Cloud Run odakli deploy hedefi
- Global external Application Load Balancer + serverless NEG hedeflenir

## Dokumanlar

Belge seti icin baslangic noktasi: [docs/README.md](/Users/sametx/Documents/ustaca%20ai/docs/README.md)

Ana kaynak belge: [docs/nihai_ana_master_belge_ustaca_ai.md](/Users/sametx/Documents/ustaca%20ai/docs/nihai_ana_master_belge_ustaca_ai.md)
