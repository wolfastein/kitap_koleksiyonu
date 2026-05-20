# SİSTEM ANALİZİ VE TASARIMI - PROJE RAPORU

**Proje Adı:** Kitap Koleksiyonu Yönetim Sistemi (SPA & RESTful API)  
**Tarih:** Mayıs 2026

---

## 1. PROJE ÖZETİ VE AMACI
Bu proje, kullanıcıların kişisel kitap koleksiyonlarını dijital ortamda yönetebilmeleri amacıyla geliştirilmiş bir web uygulamasıdır. Projenin temel amacı; JWT tabanlı kimlik doğrulama (Authentication) ile çoklu kullanıcı desteği (Multi-tenancy) sağlayarak her kullanıcının sadece kendi kitaplarını (ad, yazar, tür, ISBN, okuma durumu) güvenli ve izole bir şekilde eklemesi, güncellemesi, silmesi ve listelemesi (CRUD) süreçlerini hızlı ve modern bir arayüzle sunmaktır. Sistem Analizi ve Tasarımı prensiplerine uygun olarak Katmanlı Mimari (Layered Architecture) kullanılarak tasarlanmıştır.

## 2. KULLANILAN TEKNOLOJİLER VE GEREKÇELERİ
- **Frontend (Kullanıcı Arayüzü):** HTML5, CSS3, Vanilla JavaScript (Single Page Application - SPA). SPA yaklaşımı, sayfa yenilenmesini engelleyerek asenkron veri iletişimi (Fetch API) ile daha akıcı bir kullanıcı deneyimi sağlar.
- **Backend (Sunucu):** Node.js ve Express.js. Asenkron yapısı ve hızlı I/O işlemleri nedeniyle tercih edilmiştir. RESTful API standartlarına uygun geliştirilmiştir.
- **Güvenlik ve Kimlik Doğrulama:** JWT (JSON Web Token) ile oturum yönetimi sağlanmış ve kullanıcı şifreleri `bcrypt` ile hashlenerek saklanmıştır.
- **Veritabanı:** MySQL. İlişkisel veri modeli kullanıcılar ve kitap kayıtlarının (1'e N ilişki) yapısal ve güvenilir tutulması için idealdir (XAMPP uyumlu).
- **Test Aracı:** Jest. İş mantığı kodlarının (Business Logic) güvenilirliğini sağlamak için Birim Testleri (Unit Test) yazılmıştır.
- **Dokümantasyon:** Swagger (OpenAPI). Backend API uç noktalarının otomatik test edilebilir ve standartlara uygun dokümantasyonu için kullanılmıştır.

## 3. SİSTEM MİMARİSİ (KATMANLI MİMARİ)
Proje, bağımlılıkları azaltmak ve birim testlerini kolaylaştırmak amacıyla katmanlı mimari ile tasarlanmıştır:

1. **Sunum Katmanı (Frontend/Public):** Kullanıcının etkileşime girdiği SPA katmanıdır. İstekleri yakalar ve DOM manipülasyonu yapar.
2. **Yönlendirme Katmanı (Routes):** HTTP isteklerinin (GET, POST vb.) dinlendiği ve uygun Controller'a yönlendirildiği katmandır (`bookRoutes.js`).
3. **Kontrol Katmanı (Controllers):** Gelen HTTP isteklerini alır, veri doğrulamasını gerçekleştirir ve iş mantığını çağırdıktan sonra istemciye JSON formatında HTTP yanıtı döndürür (`bookController.js`, `authController.js`).
4. **İş Mantığı Katmanı (Services):** Sistem analizinin temel iş kurallarının işletildiği ve doğrudan veritabanı sorgularının yapıldığı katmandır (`bookService.js`).
5. **Ara Katman (Middleware):** Güvenlik kontrollerinin yapıldığı ve yetkilendirmeyi (Authorization) sağlayan katmandır (`authMiddleware.js`).
6. **Veri Erişim Katmanı (Config):** MySQL veritabanı bağlantı havuzunun (Connection Pool) bulunduğu katmandır (`db.js`).

## 4. VERİTABANI TASARIMI (ER MODELİ)
Sistemde kullanıcı ve kitap bilgilerini tutan 1'e N ilişkili iki adet tablo tasarlanmıştır.

**Tablo 1:** `users`
- `id` (INT, Primary Key, Auto Increment): Kullanıcının eşsiz numarası.
- `username` (VARCHAR(50), Not Null, Unique): Kullanıcı adı.
- `password` (VARCHAR(255), Not Null): Kriptolanmış şifre.
- `created_at` (TIMESTAMP): Kayıt tarihi.

**Tablo 2:** `books`
- `id` (INT, Primary Key, Auto Increment): Eşsiz kimlik numarası.
- `user_id` (INT, Foreign Key): Kitabın sahibi olan kullanıcının ID'si (`users(id)`).
- `title` (VARCHAR(255), Not Null): Kitap adı.
- `author` (VARCHAR(255), Not Null): Yazar adı.
- `isbn` (VARCHAR(20)): ISBN numarası.
- `genre` (VARCHAR(100)): Kitap türü.
- `reading_status` (ENUM('Okunacak', 'Okunuyor', 'Okundu')): Okuma durumu.
- `created_at` (TIMESTAMP): Kayıt tarihi.

## 5. FONKSİYONEL GEREKSİNİMLER (API UÇ NOKTALARI)
Sistem, RESTful standartlarına uyan aşağıdaki API uç noktalarını sağlamaktadır:

**Kullanıcı İşlemleri (Kimlik Doğrulama)**
- **`POST /api/auth/register`**: Yeni kullanıcı kaydı.
- **`POST /api/auth/login`**: Kullanıcı girişi ve JWT token üretimi.

**Kitap İşlemleri (JWT Gerekli)**
- **`GET /api/books`**: Sadece istek atan kullanıcıya ait tüm kitapları listeler. (`?search=...` parametresi ile arama yapılabilir).
- **`GET /api/books/:id`**: Belirli bir kitabın detayını getirir (sadece kullanıcının kendi kitabıysa).
- **`POST /api/books`**: Oturum açmış kullanıcıya ait yeni bir kitap oluşturur.
- **`PUT /api/books/:id`**: Kullanıcıya ait belirli bir kitabı günceller.
- **`DELETE /api/books/:id`**: Kullanıcıya ait belirli bir kitabı siler.

## 6. SİSTEM GÜVENLİĞİ VE DOĞRULAMA (VALIDATION)
Sistem üzerinde veri bütünlüğünü ve güvenliği sağlamak için üç aşamalı kontrol mekanizması uygulanmıştır:
1. **Kimlik Doğrulama (Authentication):** Şifreler veritabanına düz metin (plain text) yerine `bcrypt` ile kriptolanarak kaydedilir. Kullanıcı giriş yaptığında bir JWT Token üretilir. Bu token, middleware aracılığıyla her istekte (HTTP Header) doğrulanır.
2. **Kullanıcı İzolasyonu (Authorization):** Controller ve Service katmanında SQL sorgularına her zaman `user_id = ?` parametresi eklenir. Böylece kullanıcı B, kullanıcı A'nın kitaplarına müdahale edemez.
3. **Veri Doğrulaması (Validation):** Eksik veya geçersiz formatlarda gelen veriler (`reading_status` enum dışı veri gelmesi) Backend Controller katmanında yakalanarak `HTTP 400 Bad Request` yanıtı döndürülür. Aynı kontroller Frontend arayüzünde de kullanıcı deneyimi için JavaScript ile sağlanır.

## 7. TEST STRATEJİSİ
Yazılım kalite güvencesi kapsamında `bookService.js` içerisindeki iş mantığı, veritabanı bağlantısı `Mock`lanarak (jest.mock) izole edilmiştir.
- Yeni kitap ekleme başarılı/başarısız durumları,
- Tüm kitapları veya belirli bir id'ye göre kitap çekme durumları,
- Arama ve silme işlevleri Jest ile test edilmiştir.

## 8. SONUÇ
Geliştirilen bu proje, Sistem Analizi ve Tasarımı dersinin teknik beklentilerini tam anlamıyla karşılamaktadır. Esnek ve genişletilebilir yapısı sayesinde gelecekte kullanıcı doğrulama (Authentication), kitap yorumları veya dış API entegrasyonu (Google Books API gibi) özelliklerine kolaylıkla entegre edilebilir.
