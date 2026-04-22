# Data Model Spec

## Ustaca AI

## Amaç

Bu belge, ilk surum Firestore veri modelinin cekirdek koleksiyonlarini, iliski mantigini, zorunlu status alanlarini ve admin/panel projection ihtiyaclarini tanimlar.

Ana ilke:

> Tek uyelik = tek kullanici = tek isletme = tek site.

---

## Production-readiness standardi

Bu model ikinci adimda production-readiness icin ortak bir omurgaya alinmistir.

### Tum ana entity kayitlarinda ortak alanlar

* `id`
* `status`
* `created_at`
* `updated_at`
* `status_changed_at`
* `is_archived`
* `archived_at`
* `is_deleted`
* `deleted_at`

### Gecis/uyum notu

Projection katmanini bozmamak ve kademeli gecis saglamak icin bazi kayitlarda eski alias alanlar da korunur:

* `createdAt`
* `updatedAt`
* domaine ozel status alanlari:
  * `customer_status`
  * `site_status`
  * `trial_status`
  * `payment_status`
  * `domain_status`
  * `support_status`

### Referans alanlari

Ana sahiplik ve iliski alanlarinda snake_case kanoniklestirilir:

* `customer_id`
* `site_id`
* `owner_user_id`
* `active_trial_id`
* `active_payment_id`
* `primary_domain_id`
* `special_project_flag_id`
* `user_id`
* `actor_user_id`

### Admin filtre alanlari

Admin sorgulari icin normalize edilmis ust alan anahtarlari tutulur:

* `business_name_key`
* `owner_email_key`
* `city_key`
* `sector_key`
* `target_domain_key`
* `slug_key`
* `preview_hostname_key`
* `custom_domain_key`
* `hostname_key`
* `registrar_key`
* `invoice_code_key`
* `due_on_day`
* `category_key`

Bu alanlar Firestore composite index planlamasi ve admin liste filtreleri icin hazir tutulur.

---

## Ana koleksiyonlar

* `users`
* `customers`
* `sites`
* `trials`
* `payments`
* `domains`
* `form_submissions`
* `appointment_requests`
* `support_tickets`
* `ai_assistants`
* `notifications`
* `special_project_flags`
* `audit_logs`

---

## Iliski omurgasi

### Birincil baglar

* `users.customerId -> customers.id`
* `customers.ownerUserId -> users.id`
* `customers.siteId -> sites.id`
* `customers.activeTrialId -> trials.id`
* `customers.activePaymentId -> payments.id`
* `customers.primaryDomainId -> domains.id`
* `customers.specialProjectFlagId -> special_project_flags.id`

### Operasyonel baglar

* `sites.customerId -> customers.id`
* `trials.customerId -> customers.id`
* `trials.siteId -> sites.id`
* `payments.customerId -> customers.id`
* `payments.siteId -> sites.id`
* `domains.customerId -> customers.id`
* `domains.siteId -> sites.id`
* `form_submissions.customerId -> customers.id`
* `appointment_requests.customerId -> customers.id`
* `support_tickets.customerId -> customers.id`
* `ai_assistants.customerId -> customers.id`
* `notifications.customerId -> customers.id`
* `audit_logs.customerId -> customers.id`

### Zincir

`customer -> site -> trial -> payment -> domain`

Bu zincir admin panelde musteri yasam dongusunu, panel tarafinda ise tek musteri operasyonunu besler.

---

## Zorunlu status alanlari

### Customer

* `customer_status`
* degerler:
  * `draft`
  * `trial_active`
  * `trial_expired`
  * `payment_waiting`
  * `active`
  * `suspended`
  * `special_project`
  * `archived`

### Site

* `site_status`
* degerler:
  * `draft`
  * `trial_live`
  * `active`
  * `suspended`
  * `archived`

### Trial

* `trial_status`
* degerler:
  * `scheduled`
  * `active`
  * `expired`
  * `converted`
  * `cancelled`

### Payment

* `payment_status`
* degerler:
  * `pending`
  * `trialing`
  * `paid`
  * `past_due`
  * `cancelled`

### Domain

* `domain_status`
* degerler:
  * `requested`
  * `pending_verification`
  * `connected`
  * `dns_issue`
  * `archived`

### Support

* `support_status`
* degerler:
  * `open`
  * `in_progress`
  * `waiting_on_customer`
  * `resolved`
  * `closed`

---

## Koleksiyon bazli cekirdek alanlar

### `users`

* `id`
* `customerId`
* `email`
* `name`
* `role`
* `user_status`
* `lastLoginAt`
* `createdAt`
* `updatedAt`

### `customers`

* `id`
* `ownerUserId`
* `siteId`
* `businessName`
* `legalName`
* `shortDescription`
* `sector`
* `subSector`
* `contact`
* `targetDomain`
* `customer_status`
* `activeTrialId`
* `activePaymentId`
* `primaryDomainId`
* `specialProjectFlagId`
* `createdAt`
* `updatedAt`

### `sites`

* `id`
* `customerId`
* `slug`
* `previewHostname`
* `customDomain`
* `themeFamily`
* `themeVariant`
* `site_status`
* `publishedAt`
* `suspendedAt`
* `content`
* `services`
* `pricingPlans`
* `gallery`
* `enabledModules`
* `createdAt`
* `updatedAt`

### `trials`

* `id`
* `customerId`
* `siteId`
* `trial_status`
* `startsAt`
* `endsAt`
* `expiredAt`
* `convertedAt`
* `temporaryHostname`
* `targetDomain`
* `planName`
* `daysGranted`
* `createdAt`
* `updatedAt`

### `payments`

* `id`
* `customerId`
* `siteId`
* `payment_status`
* `billingCycle`
* `installmentsTotal`
* `installmentsPaid`
* `currency`
* `totalAmount`
* `paidAmount`
* `dueAt`
* `paidAt`
* `suspendedAt`
* `invoiceCode`
* `items`
* `createdAt`
* `updatedAt`

### `domains`

* `id`
* `customerId`
* `siteId`
* `domain_status`
* `requestedHostname`
* `normalizedHostname`
* `trialHostname`
* `liveHostname`
* `dnsTarget`
* `registrar`
* `managedByUstaca`
* `sslEnabled`
* `verifiedAt`
* `expiresAt`
* `lastCheckAt`
* `createdAt`
* `updatedAt`

### `form_submissions`

* `id`
* `customerId`
* `siteId`
* `request_status`
* `name`
* `phone`
* `email`
* `service`
* `source`
* `message`
* `notes`
* `submittedAt`
* `createdAt`
* `updatedAt`

### `appointment_requests`

* `id`
* `customerId`
* `siteId`
* `request_status`
* `name`
* `phone`
* `requestedService`
* `requestedAt`
* `notes`
* `createdAt`
* `updatedAt`

### `support_tickets`

* `id`
* `customerId`
* `siteId`
* `support_status`
* `subject`
* `category`
* `priority`
* `channel`
* `customerMessage`
* `opsNote`
* `resolvedAt`
* `lastResponseAt`
* `createdAt`
* `updatedAt`

### `ai_assistants`

* `id`
* `customerId`
* `siteId`
* `channel`
* `enabled`
* `greeting`
* `primaryGoal`
* `escalationRoute`
* `maxCatalogItems`
* `knowledgeScope`
* `createdAt`
* `updatedAt`

### `notifications`

* `id`
* `customerId`
* `siteId`
* `userId`
* `channel`
* `eventName`
* `notification_status`
* `recipient`
* `subject`
* `attemptCount`
* `lastAttemptAt`
* `sentAt`
* `payload`
* `createdAt`
* `updatedAt`

### `special_project_flags`

* `id`
* `customerId`
* `siteId`
* `special_project_status`
* `reason`
* `requestedFeature`
* `priority`
* `opsNote`
* `routedAt`
* `createdAt`
* `updatedAt`

### `audit_logs`

* `id`
* `customerId`
* `siteId`
* `actorUserId`
* `actorRole`
* `action`
* `targetCollection`
* `targetId`
* `summary`
* `metadata`
* `createdAt`
* `updatedAt`

---

## Projection mantigi

Bu cekirdek modelden iki ana projection cikartilir:

### Admin projection

* musteri listesi
* odeme ledger gorunumu
* domain overview
* platform support listesi

### Musteri panel projection

* `CustomerWorkspace`
* tek musteriye ait:
  * business
  * site
  * trial
  * payments
  * domains
  * support
  * lead kayitlari
  * AI ayarlari

Projection katmani `packages/db/src/services.ts` icinde tutulur.

---

## Repository katmani

Repository sozlesmeleri su gruplara ayrilir:

* `users`
* `customers`
* `sites`
* `trials`
* `payments`
* `domains`
* `formSubmissions`
* `appointmentRequests`
* `supportTickets`
* `aiAssistants`
* `notifications`
* `specialProjectFlags`
* `auditLogs`

Her repository sade ama buyuyebilir query ihtiyaclarini kapsar:

* `getById`
* `listByCustomer`
* `listByStatus`
* `upsert`
* ilgili koleksiyon icin gerekli ek sorgular

---

## Mock ve seed

Ilk surum icin in-memory seed dataset ve repository iskeleti hazirlanmistir:

* `packages/db/src/seeds.ts`
* `packages/db/src/in-memory.ts`

Bu seed:

* trial aktif bir musteri
* aktif/ucretli bir musteri
* gecikmede/askida bir musteri
  senaryolarini ayni anda tasir.

---

## Sonuc

Bu model:

* sade ama buyuyebilir
* Firestore uyumlu
* tek kullanicili ilk surume uygun
* admin ve panel projection ihtiyaclarini besleyebilir
* gereksiz collection patlamasi yaratmadan temel is akislarini tasir
