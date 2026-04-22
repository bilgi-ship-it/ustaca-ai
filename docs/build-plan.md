# Sprint Backlog / Teknik İş Planı

## Ustaca AI

## 1. Belgenin amacı

Bu belge, Ustaca AI’nin yazılım inşasını sprint mantığıyla sıraya koyar.

Amaç:

* neyin önce yapılacağını netleştirmek
* Codex’e parça parça, uygulanabilir görevler üretmek
* çekirdek omurgayı gereksiz dağılmadan kurmak
* panel, trial, ödeme, domain ve AI üretim hattını kontrollü sırada inşa etmektir

Bu belge “strateji” değil, **uygulama sırası** belgesidir.

---

## 2. Genel sprint ilkesi

Bu projede sprint sırası şu kurala göre ilerler:

1. omurga
2. veri modeli
3. panel iskeletleri
4. trial ve ödeme akışı
5. domain ve yayın mantığı
6. form/randevu modülleri
7. AI üretim hattı
8. ek hizmet yönetimi
9. operasyon ve hukuk
10. iyileştirme

### Ana kural

> Görünen ekranlardan önce çalışan iş akışı kurulmalıdır.

---

## 3. Sprint 0 — Kurulum ve temel iskelet

### Hedef

Kod tabanını ayağa kaldırmak.

### Yapılacaklar

* monorepo yapısını kur
* `apps/web`
* `apps/admin`
* `apps/panel`
* `packages/ui`
* `packages/types`
* `packages/config`
* `packages/lib`
* `packages/ai`
* `packages/email`
* lint / format / typecheck yapısını kur
* ortak env/config mantığını kur
* temel route yapısını oluştur

### Çıktı

* çalışan monorepo
* üç uygulama ayağa kalkmış
* ortak package mimarisi hazır

### Kabul kriteri

* localde tüm uygulamalar açılıyor
* ortak package import ediliyor
* build kırılmıyor

---

## 4. Sprint 1 — Auth ve rol sistemi

### Hedef

Sisteme güvenli giriş ve rol ayrımı kurmak.

### Yapılacaklar

* auth akışını kur
* login ekranları
* oturum yönetimi
* route protection
* rol kontrolü
* `super_admin`
* `ops_admin`
* `customer`

### Kurallar

* tek kullanıcı
* tek işletme
* çoklu kullanıcı yok
* müşteri yalnızca kendi verisini görür

### Çıktı

* admin giriş çalışır
* müşteri giriş çalışır
* yanlış role yanlış ekran açılmaz

### Kabul kriteri

* admin paneline admin girer
* müşteri paneline müşteri girer
* oturumsuz erişim engellenir

---

## 5. Sprint 2 — Veri modeli çekirdeği

### Hedef

Temel veri omurgasını kurmak.

### Yapılacaklar

Aşağıdaki ana kayıtları oluştur:

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

* site_status
* trial_status
* payment_status
* domain_status
* support_status

### Çıktı

* çekirdek koleksiyonlar/tablolar hazır
* örnek seed veya mock veriyle ekran beslenebilir

### Kabul kriteri

* müşteri detayı veriyle dolabiliyor
* trial / payment / domain alanları net

---

## 6. Sprint 3 — Admin panel iskeleti

### Hedef

Operasyonun kullanacağı ana paneli ayağa kaldırmak.

### Yapılacaklar

* admin dashboard
* müşteri listesi
* müşteri detay ekranı
* trial yönetimi ekranı
* ödeme yönetimi ekranı
* domain durumu ekranı
* destek kayıtları ekranı
* raporlama özeti
* rol/erişim görünürlüğü

### Tasarım ilkesi

* sade
* kart tabanlı
* tablo varsa filtreli
* kritik aksiyonlar görünür

### Çıktı

* operasyon paneli işlevsel iskelet halinde çalışır

### Kabul kriteri

* müşteri listesi açılıyor
* detay sayfası açılıyor
* trial ve ödeme alanları görünüyor

---

## 7. Sprint 4 — Müşteri panel iskeleti

### Hedef

Müşterinin kendi verisini yöneteceği paneli açmak.

### Yapılacaklar

* genel bakış
* site bilgileri
* hizmet/fiyat alanı
* galeri alanı
* form talepleri
* randevu talepleri
* domain durumu
* ödeme durumu
* destek talebi
* site AI asistan ayarları

### Kurallar

* müşteri başka hesap görmez
* panel basit kalır
* teknik terim azaltılır

### Çıktı

* müşteri kendi verisini düzenleyebilir

### Kabul kriteri

* bir müşteri giriş yapıp kendi sayfalarını görebilir
* temel kayıtları güncelleyebilir

---

## 8. Sprint 5 — Trial sistemi

### Hedef

7 günlük deneme akışını çalıştırmak.

### Yapılacaklar

* trial başlatma
* başlangıç ve bitiş tarihi
* `trial_active` durumu
* trial kapanış job mantığı
* trial bitince erişim kapama
* veri saklama
* sonra aktive edebilme mantığı

### Kurallar

* trial gerçek üründür
* sadece link geçicidir
* trial sonunda otomatik kapanır
* veri silinmez

### Çıktı

* deneme sistemi çalışır

### Kabul kriteri

* test müşterisi trial başlatabilir
* trial süresi dolunca durum değişir
* erişim kapanır ama veri kalır

---

## 9. Sprint 6 — Domain ve subdomain modeli

### Hedef

Geçici yayın ve hedef domain mantığını oturtmak.

### Yapılacaklar

* slug üretimi
* çakışma kontrolü
* `slug.ustaca.app` mantığı
* hedef domain alanı
* uygunluk durumu alanı
* domain durum ekranları

### Kurallar

* dış domain kabulü yok
* müşteri başta hedef domain adını bildirir
* trial subdomain ile başlar
* ödeme sonrası geçiş operasyon tarafında olur

### Çıktı

* domain süreci kayıt altına alınır

### Kabul kriteri

* benzersiz slug oluşur
* müşteri ve admin panelde domain durumu görünür

---

## 10. Sprint 7 — Ödeme ve askıya alma

### Hedef

Finansal akışı sisteme bağlamak.

### Yapılacaklar

* ürün bazlı ücret kaydı
* taksit sayısı kaydı
* ödeme işlendi alanı
* ödeme gecikme alanı
* askıya alma mantığı
* tekrar açma mantığı

### Kurallar

* tüm ürünler 1 yıllık
* 2 / 3 / 4 / 5 / 6 / 9 / 12 taksit
* ödeme gelmeden tam aktivasyon yok
* gecikmede yayın askıya alınır

### Çıktı

* ödeme görünürlüğü ve askı mantığı çalışır

### Kabul kriteri

* admin ödeme işleyebilir
* müşteri ödeme durumunu görebilir
* askıya alma statüsü tetiklenebilir

---

## 11. Sprint 8 — Form ve randevu modülleri

### Hedef

İş getiren çekirdek modülleri açmak.

### Yapılacaklar

#### Form modülü

* teklif al
* bilgi al
* iletişim bırak

#### Randevu modülü

* tarih tercihi
* saat tercihi
* not alanı
* kayıt listesi

### Çıktı

* müşteri sitelerinde temel lead toplama mantığı oluşur

### Kabul kriteri

* form bırakılabiliyor
* randevu talebi bırakılabiliyor
* kayıtlar panelde görünüyor

---

## 12. Sprint 9 — Ürün modül sistemi

### Hedef

Ana ürün ve ek hizmetleri modül mantığına bağlamak.

### Yapılacaklar

* ana ürün: web sitesi
* ek hizmet: haritada çık
* ek hizmet: yorum topla
* ek hizmet: menü fiyat
* ek hizmet: randevu iste
* ek hizmet: fiyat sor
* ek hizmet: görünürlük raporu
* ek hizmet: çok dilli site
* ek hizmet: WhatsApp AI
* ek hizmet: site AI

### Çıktı

* admin panelden ürün atama yapılabilir
* müşteri panelinde yalnızca aldığı modüller görünür

### Kabul kriteri

* modül aç/kapa çalışır
* görünürlük doğru yönetilir

---

## 13. Sprint 10 — Bilgi toplama akışı

### Hedef

Müşteri bilgisini düzenli toplamak.

### Yapılacaklar

* sektör seçimi
* alt sektör seçimi
* işletme adı
* açıklama
* hizmetler
* fiyatlar
* renk/stil tercihleri
* CTA tercihi
* form/randevu ihtiyacı
* hedef domain bilgisi
* ek hizmet seçimi

### Kurallar

* form ağırlıklı akış
* serbest sohbet minimum
* AI ilk aşamada yorulmaz

### Çıktı

* yapılandırılmış onboarding akışı

### Kabul kriteri

* müşteri formu tamamlayabiliyor
* sistem anlamlı veri seti üretiyor

---

## 14. Sprint 11 — Site blueprint/spec sistemi

### Hedef

Form verisini AI üretimine uygun yapıya çevirmek.

### Yapılacaklar

* sektör sınıflandırma
* modül seçimi
* özel proje tetik kontrolü
* tema ailesi seçimi
* CTA önerisi
* site blueprint çıktısı

### Blueprint alanları

* sektör
* alt sektör
* amaç
* sayfa yapısı
* section listesi
* renk yönü
* CTA yapısı
* aktif modüller
* AI asistan yönü
* hariç tutulan özellikler

### Çıktı

* yapılandırılmış `site_blueprint`

### Kabul kriteri

* form verisi blueprint’e dönüşüyor
* özel proje etiketi gerekirse atanıyor

---

## 15. Sprint 12 — AI üretim pipeline taslağı

### Hedef

Gerçek üretim öncesi pipeline iskeletini kurmak.

### Yapılacaklar

* blueprint al
* tema ailesi seç
* üretim görevi oluştur
* sonuç kaydı tut
* hata / başarı alanı tanımla
* preview durumu üret

### Kurallar

* tam serbest üretim yok
* kontrollü üretim var
* 3–5 tema ailesi mantığı korunur

### Çıktı

* yarı çalışan üretim hattı iskeleti

### Kabul kriteri

* bir müşteri için üretim görevi oluşuyor
* çıktı durumu kaydediliyor

---

## 16. Sprint 13 — Site AI Asistanı

### Hedef

Site içinde temel AI asistanı açmak.

### İlk sürüm görevleri

* ziyaretçiyi karşıla
* hizmetleri anlat
* forma yönlendir
* randevuya yönlendir

### Yapılacaklar

* asistan ayar alanı
* aktif/pasif
* kısa yönlendirme içerikleri
* müşteri panelinden yönetim

### Çıktı

* temel site AI modülü

### Kabul kriteri

* müşteri panelinden açılıp kapanabiliyor
* yönlendirme mantığı çalışıyor

---

## 17. Sprint 14 — E-posta bildirim sistemi

### Hedef

İlk sürüm operasyonel bildirimlerini çalıştırmak.

### Bildirim olayları

* yeni üye
* trial başladı
* trial bitti
* ödeme geldi
* ödeme gecikti
* yayın askıya alındı
* destek talebi açıldı
* özel proje işaretlendi
* domain sorunu
* üretim hatası

### Yapılacaklar

* e-posta şablonları
* event üretimi
* queue/job mantığı
* log kaydı

### Çıktı

* çalışan temel bildirim sistemi

### Kabul kriteri

* olay sonrası e-posta gidiyor
* hata loglanıyor

---

## 18. Sprint 15 — Hukuk ve onboarding

### Hedef

Kayıt akışını güvenli hale getirmek.

### Yapılacaklar

* üyelik sözleşmesi onayı
* hizmet şartları onayı
* KVKK aydınlatma alanı
* içerik sorumluluğu kabulü
* kayıt anında onay loglama

### Çıktı

* yasal onboarding

### Kabul kriteri

* kullanıcı onay vermeden devam edemiyor
* onay kayıt altında

---

## 19. Sprint 16 — Admin operasyon derinleştirme

### Hedef

Operasyon ekibinin günlük işini kolaylaştırmak.

### Yapılacaklar

* daha iyi müşteri detay ekranı
* ödeme geçmişi görünümü
* destek durum etiketleri
* özel proje işaretleme akışı
* e-posta olay geçmişi
* operasyon notları

### Çıktı

* panel daha yaşanabilir hale gelir

### Kabul kriteri

* operasyon bir müşteriyi uçtan uca panelden takip edebilir

---

## 20. Sprint 17 — Tasarım sistemi ve tema kütüphanesi

### Hedef

Kod tarafında görsel dağınıklığı bitirmek.

### Yapılacaklar

* renk tokenları
* spacing tokenları
* typography scale
* button system
* card system
* input/form system
* status badge system
* theme family presets

### Çıktı

* ortak UI omurgası

### Kabul kriteri

* web, admin ve panel aynı tasarım ailesinden geliyor
* müşteri siteleri tema preset ile üretilebiliyor

---

## 21. Sprint 18 — Lansman hazırlığı

### Hedef

Canlıya çıkabilecek minimum güven seviyesine gelmek.

### Yapılacaklar

* smoke test listesi
* go-live checklist
* trial testi
* ödeme testi
* askı testi
* panel erişim testi
* e-posta testi
* örnek müşteri senaryosu testi

### Çıktı

* canlıya çıkış öncesi kontrol seti

### Kabul kriteri

* kritik akışlar uçtan uca test edilmiş olur

---

## 22. Faz 2 backlog adayları

İlk sürüm sonrası açılabilecek işler:

* WhatsApp AI standard ürünleştirme iyileştirmesi
* çok dilli müşteri sitesi iyileştirmesi
* görünürlük raporu derinleştirme
* Google profil operasyon ekranı geliştirme
* daha iyi raporlama
* theme family sayısını artırma
* destek merkezi iyileştirmesi
* e-posta yerine çok kanallı bildirim hazırlığı

---

## 23. Faz 3 backlog adayları

Daha sonraya bırakılacaklar:

* mobil uygulama
* çoklu kullanıcı
* çoklu şube
* SMS bildirim
* gelişmiş WhatsApp entegrasyonu
* ağır dashboard
* dış domain kabulü
* tam e-ticaret
* online ödeme
* üyelikli özel sistemler
* ERP / CRM entegrasyonları

---

## 24. Sprint öncelik kuralı

Her backlog maddesi şu filtreyle değerlendirilir:

### Öncelik 1

Olmadan sistem satılamaz

### Öncelik 2

Olmadan operasyon zorlaşır

### Öncelik 3

Olmadan ürün daha az çekici olur

### Öncelik 4

Olsa iyi olur ama bekleyebilir

### Örnek

* auth = öncelik 1
* trial = öncelik 1
* ödeme = öncelik 1
* AI üretim pipeline = öncelik 2
* güzel rapor ekranı = öncelik 4

---

## 25. Sonuç

Bu sprint backlog’un özeti şudur:

> Önce çalışan omurga kurulacak; sonra trial, ödeme, domain ve panel akışları oturtulacak; ardından form/randevu ve AI üretim hattı devreye alınacak; ek hizmetler modül mantığıyla sisteme bağlanacak; daha ağır ve riskli konular sonraki fazlara bırakılacaktır.
