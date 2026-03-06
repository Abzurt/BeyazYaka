# Canlıya Alma Rehberi (Deployment Guide)

Bu projeyi tamamen ücretsiz ve profesyonel bir şekilde canlıya almak için en iyi yöntem **Vercel + GitHub** ikilisidir.

## 1. Hazırlık (GitHub)
Kodunuzu bir GitHub deposuna yüklemeniz gerekir:
1.  GitHub üzerinde yeni bir **Private** (Gizli) depo oluşturun.
2.  Terminalden şu komutlarla kodunuzu gönderin:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git remote add origin [SİZİN_REPO_LİNKİNİZ]
    git push -u origin main
    ```

## 2. Dağıtım (Vercel)
1.  [Vercel.com](https://vercel.com) adresine gidin ve GitHub hesabınızla giriş yapın.
2.  **"Add New" > "Project"** butonuna tıklayın.
3.  GitHub deponuzu seçin ve **"Import"** deyin.

## 3. Ortam Değişkenleri (KRİTİK)
Vercel panelindeki "Environment Variables" bölümüne şu bilgileri eklemelisiniz:

| Key | Value (Örnek) |
| :--- | :--- |
| `DATABASE_URL` | Sizin Neon bağlantı dizeniz |
| `AUTH_SECRET` | Rastgele 32 karakterli bir yazı |
| `NEXTAUTH_URL` | `https://proje-adiniz.vercel.app` (Vercel'in size verdiği link) |
| `GOOGLE_CLIENT_ID` | Google Console'dan aldığınız ID |
| `GOOGLE_CLIENT_SECRET` | Google Console'dan aldığınız Secret |

## 4. Canlıya Geçiş
Butona bastığınızda Vercel:
- Projenizi derleyecek (Build).
- Prisma istemcisini oluşturacak (`postinstall` scripti sayesinde).
- Size `https://beyaz-yaka-dosyasi.vercel.app` gibi bir link verecektir.

## Avantajları
- **Ücretsiz**: Belirli bir trafiğe kadar kuruş ödemezsiniz.
- **Otomatik**: GitHub'a her `git push` yaptığınızda siteniz otomatik güncellenir.
- **SSL**: Siteniz anında `https://` (güvenli) olur.

---

**Not:** Google Auth için Google Console'daki "Authorized Redirect URIs" kısmına canlı linkinizi eklemeyi unutmayın:  
`https://[SİTE_ADINIZ].vercel.app/api/auth/callback/google`
