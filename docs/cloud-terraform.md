# Google Cloud + Terraform Belgesi

## Ustaca AI

## 1. Belgenin amacı

Bu belge, Ustaca AI’nin Google Cloud üzerinde nasıl kurulacağını, hangi kaynakların Terraform ile yönetileceğini, ortamların nasıl ayrılacağını ve altyapı ile uygulama sınırlarının nasıl korunacağını tanımlar.

Bu belgenin amacı:

* cloud tarafını dağılmadan kurmak
* dev / staging / prod ayrımını netleştirmek
* hangi kaynağın Terraform’da, hangisinin uygulama içinde olacağını sabitlemek
* Codex ve teknik geliştirme tarafına net yön vermek
* ilk sürümde hızlı ama sonradan bozulmayan bir altyapı kurmaktır

---

## 2. Temel cloud ilkeleri

Ustaca AI için Google Cloud yaklaşımı şu ilkelere dayanır:

* Google Cloud merkezli mimari
* GitHub merkezli kaynak kod yönetimi
* dev / staging / prod ayrımı
* serverless ve yönetilen servis önceliği
* tekrar üretilebilir kurulum
* mümkün olduğunca kodla yönetim
* ilk sürümde sade, sonraki sürümlerde büyüyebilir yapı
* uygulama verisi ile altyapı verisinin ayrılması

Kısa kural:

> Uygulama işini uygulama, altyapı işini Terraform yönetir.

---

## 3. Genel yerleşim modeli

Ustaca AI üç ana çalışma alanından oluşur:

### A) Pazarlama yüzü

* `www.ustacacozum.com`

Amaç:

* tanıtım
* fiyat
* kayıt / trial
* güven ve lansman yüzü

### B) Uygulama yüzü

* `ustaca.app`

Alt alanlar:

* `panel.ustaca.app`
* `admin.ustaca.app`
* `slug.ustaca.app`

Amaç:

* müşteri paneli
* admin paneli
* trial ve yayın siteleri

### C) Google Cloud arka planı

Amaç:

* API
* veri
* dosya
* job
* queue
* log
* secret
* deploy
* yayın ve yönlendirme

---

## 4. Ortam stratejisi

İlk sürümde üç ortam olacaktır:

* **dev**
* **staging**
* **prod**

### dev

Amaç:

* aktif geliştirme
* hızlı test
* Codex ile deneysel ilerleme

### staging

Amaç:

* canlı öncesi doğrulama
* entegrasyon testi
* operasyon testi

### prod

Amaç:

* gerçek müşteri
* gerçek trial
* gerçek yayın
* gerçek ödeme durumu
* gerçek domain akışı

### Kural

* canlı ortamda doğrudan geliştirme yapılmaz
* prod kaynaklarına manuel müdahale minimumda tutulur
* staging, prod’a en yakın test alanı olur

---

## 5. Google Cloud proje yapısı

Önerilen yapı:

* `ustaca-dev`
* `ustaca-staging`
* `ustaca-prod`

### Bu yapının nedeni

* fatura görünürlüğü
* kaynak izolasyonu
* güvenlik
* yanlışlıkla prod bozma riskini azaltma
* Terraform state ayrımı
* servis bazlı hata etkisini azaltma

### Ana ilke

Tek ana Google Cloud hesabı altında ayrı proje mantığıyla ilerlenir.

---

## 6. Bölge seçimi yaklaşımı

### Karar mantığı

Bölge seçiminde iki ayrı ihtiyaç vardır:

#### 1. Uygulama ve müşteri verisi

Burada öncelikler:

* erişim hızı
* veri düzeni
* operasyonel denge
* gelecekte veri hassasiyeti

#### 2. AI üretim ve yenilik

Burada öncelikler:

* yeni özelliklere daha hızlı erişim
* kısıtsız deney alanı
* AI servis rahatlığı

### Önerilen yaklaşım

#### Varsayılan uygulama/prod mantığı

* Avrupa merkezli ana bölge tercih edilir

#### AI üretim / deneysel taraf

* ABD bölgesi tercih edilebilir

### Tek bölgeyle başlamak zorundaysak

En pratik başlangıç mantığı:

* `us-central1` güçlü aday
* ama ürün ana kitlesi Türkiye olduğu için uygulama performansı ayrıca gözlenmelidir

### Belge kararı

> İlk sürümde bölge seçimi, uygulama/üretim ihtiyaçlarına göre bilinçli verilecektir. AI yenilik ve servis rahatlığı öncelikli senaryolarda ABD bölgesi avantajlıdır; müşteri uygulaması ve veri tarafında ise erişim ve veri hassasiyeti ayrıca değerlendirilir.

---

## 7. İlk sürümde kullanılacak ana servisler

Ustaca AI için ilk sürüm çekirdek servis seti:

### 1. Cloud Run

Kullanım:

* ana API
* admin backend
* müşteri panel backend
* iş kuralları servisi
* üretim hattı servisleri
* webhook / job tetikleyici hafif servisler

### Neden?

* serverless
* otomatik ölçeklenir
* ilk sürüm için yönetimi kolaydır
* düşük/orta trafik için uygundur
* container tabanlıdır

---

### 2. Firestore

Kullanım:

* users
* customers
* sites
* trials
* payments
* domains
* form_submissions
* appointment_requests
* support_tickets
* ai_assistants
* notifications
* audit_logs

### Neden?

* hızlı başlangıç
* yönetilen veri yapısı
* panel işlerine uygun esneklik
* sık değişen kayıtlar için pratik

---

### 3. Cloud Storage

Kullanım:

* logo
* görseller
* galeri dosyaları
* destek dosyaları
* geçici export’lar
* rapor çıktıları
* üretim tarafı ara dosyaları gerekiyorsa

---

### 4. Auth katmanı

Kullanım:

* müşteri giriş
* admin giriş
* rol bazlı erişim

### Beklenen özellikler

* oturum yönetimi
* route protection
* rol kontrolü
* tek kullanıcı mantığına uygun sade yapı

---

### 5. Cloud Scheduler

Kullanım:

* trial bitiş kontrolü
* ödeme gecikme kontrolü
* askıya alma işleri
* gecikmiş operasyon işlerinin tetiklenmesi
* düzenli bakım görevleri

---

### 6. Cloud Tasks

Kullanım:

* e-posta kuyrukları
* trial kapanış sonrası arka plan işleri
* site üretim kuyruğu
* gecikmeli görevler
* yeniden denenecek işler

---

### 7. Secret Manager

Kullanım:

* API anahtarları
* servis gizli bilgileri
* e-posta erişimleri
* AI servis anahtarları
* dış sistem bağlantı sırları

---

### 8. Logging / Monitoring

Kullanım:

* hata izleme
* deploy sonrası gözlem
* job başarısızlıkları
* üretim pipeline hataları
* ödeme / domain / trial iş akışı görünürlüğü

---

## 8. Domain ve yayın mimarisi

### Alan yapısı

* `www.ustacacozum.com`
* `ustaca.app`
* `panel.ustaca.app`
* `admin.ustaca.app`
* `slug.ustaca.app`

### Yayın mantığı

* pazarlama sitesi ayrı yüzdür
* uygulama ve müşteri yayını ayrı yüzdür
* trial siteleri `slug.ustaca.app` altında yayınlanır
* ödeme sonrası kontrollü domain geçişi yapılır
* dış domain kabulü ilk sürümde kapalıdır

---

## 9. Load balancer ve routing yaklaşımı

İlk sürümde önerilen model:

* global load balancer
* panel ve admin için net route ayrımı
* müşteri yayınları için kontrollü yönlendirme
* SSL merkezi yönetim
* gerektiğinde wildcard / çoklu host mantığına uygun zemin

### Neden?

* alan adı yönetimi daha temiz olur
* ileride büyüme daha kolay olur
* panel ve yayın tarafı birbirinden ayrılır
* prod yönetimi sadeleşir

---

## 10. Cloud Run servis mantığı

İlk sürümde iki olası yol vardır:

### Yol 1 — Tek büyük backend

Hızlıdır ama uzun vadede karışabilir.

### Yol 2 — Çok parçalı mikro servis

Temiz görünür ama erken dönemde operasyonu şişirebilir.

### Ustaca AI kararı

## **Modüler tek ana API + gerektiğinde birkaç yardımcı servis**

Yani:

* iş mantığı tek ana omurgada toplanır
* ama bazı job/worker mantıkları ayrı tutulabilir
* ilk sürümde gereksiz servis parçalanmasına gidilmez

### Ana modüller

* auth
* customers
* sites
* trials
* billing
* domains
* forms
* appointments
* support
* ai
* notifications
* admin

---

## 11. Uygulama verisi ile altyapı verisinin ayrımı

### Terraform tarafı

Şunları yönetir:

* GCP proje kaynakları
* API enable işlemleri
* servis hesapları
* IAM
* Cloud Run servisleri
* Storage bucket’ları
* Scheduler
* Tasks
* Secret Manager altyapısı
* load balancer
* DNS / routing ile ilgili GCP kaynakları
* monitoring / alerting kaynakları

### Uygulama tarafı

Şunları yönetir:

* müşteri kayıtları
* site ayarları
* trial kayıtları
* ödeme durumları
* destek kayıtları
* AI blueprint/spec verileri
* ürün modül aktiflikleri
* operasyon notları

### Ana kural

> Terraform altyapıyı kurar. Uygulama işi işletir.

---

## 12. Terraform kapsamı

İlk sürümde Terraform’un kesin yöneteceği alanlar şunlardır:

### A) Project base

* proje bazlı servis aktivasyonları
* temel etiketler
* servis hesapları
* IAM başlangıç kuralları

### B) Networking / publishing

* load balancer
* backend bağlantıları
* serverless target bağlantıları
* SSL ile ilgili GCP tarafı
* DNS tarafında GCP’de tutulan parçalar varsa onlar

### C) Runtime

* Cloud Run servisleri
* environment variable tanımları
* servis hesaplarına bağlama
* minimum/maximum scaling ilkeleri
* bucket tanımları

### D) Background jobs

* Scheduler job’ları
* Tasks queue’ları

### E) Secrets

* Secret Manager secret tanımları
* erişim kuralları

### F) Observability

* temel alarm ve monitoring kaynakları

---

## 13. Terraform ile ilk sürümde zorlamayacağımız alanlar

İlk sürümde her şeyi altyapı koduna taşımaya çalışmak gereksizdir.

### Sonraya bırakılabilecek alanlar

* müşteri bazlı içerik seed’leri
* uygulama içi operational seed datalar
* tek tek müşteri bootstrap verileri
* üretim sırasında oluşan blueprint kayıtları
* panel içi default içeriklerin tamamı
* admin içi bazı manuel operasyon notları

### Neden?

Bunlar uygulama verisidir, altyapı verisi değildir.

---

## 14. Terraform klasör yapısı

Önerilen yapı:

```text
infra/
  modules/
    project_base/
    iam/
    cloud_run_service/
    load_balancer/
    storage/
    scheduler/
    tasks/
    secrets/
    monitoring/
  envs/
    dev/
    staging/
    prod/
```

### Her modülde beklenen dosyalar

* `main.tf`
* `variables.tf`
* `outputs.tf`
* `README.md`

### Ana ilke

* modül küçük ama anlamlı olsun
* her modül tek sorumluluk taşısın
* açıklamasız variable bırakılmasın
* kopyala-yapıştır altyapı yerine modül mantığı kurulsun

---

## 15. Terraform çalışma disiplini

### Kurallar

* `main` branch korunur
* feature branch ile ilerlenir
* PR olmadan merge yapılmaz
* prod değişikliği kayıtlı olur
* önce plan, sonra apply mantığı korunur
* dev/staging denemeleri prod’a taşınmadan önce gözden geçirilir

### Neden?

* altyapı değişikliği görünür olur
* geri dönüş daha kolay olur
* ekipte karar izi kalır

---

## 16. IAM ve erişim ilkeleri

### Temel prensip

* minimum yetki
* ortam ayrımı
* admin ile uygulama servis hesabının ayrılması

### Beklenen yapı

* uygulama servis hesabı
* job/worker servis hesabı
* deploy servis hesabı
* monitoring / operasyon erişimleri

### Kural

* prod erişimi herkesin günlük kullanım alanı olmamalı
* dev ve staging rahat, prod kontrollü olmalı

---

## 17. Secret ve konfigürasyon yönetimi

### Kural

* gizli bilgi koda yazılmaz
* `.env` sadece yerel geliştirme içindir
* staging/prod sırları Secret Manager’da tutulur
* ortamlar arası secret karışmaz

### Secret örnekleri

* AI provider anahtarları
* e-posta servis sırları
* domain işlemleriyle ilgili sırlar
* harici servis erişim tokenları

---

## 18. Firestore veri yaklaşımı

### İlke

Veri modeli ekran ve iş akışı ihtiyaçlarına göre kurulacaktır.

### Ana koleksiyon/varlıklar

* users
* customers
* sites
* trials
* payments
* domains
* form_submissions
* appointment_requests
* support_tickets
* ai_assistants
* notifications
* special_project_flags
* audit_logs

### Zorunlu durum alanları

* trial_status
* payment_status
* domain_status
* site_status
* support_status

### Teknik not

* index gerektiren sorgular erken tespit edilmelidir
* admin panel filtreleri düşünülerek veri alanları belirlenmelidir

---

## 19. Site üretim hattının cloud yerleşimi

### Girdi

* müşteri form verisi
* sektör / alt sektör
* renk / stil tercihleri
* modül tercihleri

### İşleme

* blueprint/spec üretimi
* tema ailesi seçimi
* özel proje mi standart mı kararı
* üretim görevi oluşturma

### Çıktı

* üretim görevi
* preview kaydı
* yayın hazırlığı
* hata veya başarı durumu

### Cloud tarafı mantık

* API isteği ile başlar
* gerektiğinde arka plan kuyruğuna düşer
* e-posta / admin uyarısı üretilebilir
* yayın sonucu loglanır

---

## 20. E-posta bildirim mimarisi

İlk sürümde:

* WhatsApp bildirim yok
* SMS bildirim yok
* tüm sistem bildirimleri e-posta ile çalışır

### Bildirim olayları

* yeni üye
* trial başladı
* trial bitti
* ödeme geldi
* ödeme gecikti
* yayın askıya alındı
* destek talebi açıldı
* özel proje etiketi atandı
* site üretim hatası
* domain sorunu

### Teknik yaklaşım

* event üret
* queue’ya düşür
* e-posta şablonu ile gönder
* log tut
* tekrar deneme mantığı kur

---

## 21. Trial ve askıya alma için job yaklaşımı

### Trial job’ları

* trial bitiş kontrolü
* biten trial’ın durum güncellemesi
* müşteri erişim kapama
* yayın askı işareti

### Ödeme job’ları

* gecikme kontrolü
* askı kararı
* durum güncellemesi
* bildirim üretimi

### İlke

Zaman tabanlı kritik işler panel kullanıcı davranışına bağlı olmamalıdır.
Mutlaka job/scheduler ile çalışmalıdır.

---

## 22. Logging ve gözlemleme

İlk sürümde bile görünür olması gerekenler:

* deploy hataları
* Cloud Run hata oranı
* üretim pipeline hataları
* trial kapanış başarısızlıkları
* e-posta gönderim hataları
* domain geçiş hataları
* ödeme işleme hataları

### Log kaydında beklenen alanlar

* zaman
* servis adı
* seviye
* müşteri/site referansı
* işlem adı
* hata özeti

---

## 23. İlk sürümde manuel kalabilecek alanlar

Hız için bazı alanlar ilk sürümde yarı manuel bırakılabilir:

* bazı domain satın alma adımları
* bazı özel operasyon onayları
* WhatsApp AI ürününün aktivasyon kararı
* özel proje etiketinden sonraki insan kararı
* bazı ilk müşteri içerik düzeltmeleri

Ama bunlar kalıcı manuel süreç olarak düşünülmez; sonradan otomasyon adaylarıdır.

---

## 24. Cloud karar özeti

Bu belgede sabitlenen cloud kararları:

* Google Cloud merkezli kurulum
* GitHub monorepo
* dev / staging / prod ayrımı
* Cloud Run ana runtime
* Firestore ana veri katmanı
* Storage medya katmanı
* Scheduler + Tasks iş kuyruğu
* Secret Manager zorunlu
* e-posta tabanlı ilk bildirim sistemi
* load balancer merkezli yayın mimarisi
* Terraform ile altyapı yönetimi
* uygulama verisi ile altyapı verisinin ayrılması

---

## 25. Codex’e cloud tarafı için verilecek ilk teknik görevler

### Görev 1

`infra/` klasör yapısını kur

### Görev 2

dev / staging / prod environment iskeletini çıkar

### Görev 3

Cloud Run servis modülünü oluştur

### Görev 4

Storage / Scheduler / Tasks modüllerini oluştur

### Görev 5

Load balancer ve domain yönü için temel şema çıkar

### Görev 6

Secret Manager ve IAM başlangıç yapılarını çıkar

### Görev 7

Deploy ve runtime config mantığını uygulama tarafına bağla
