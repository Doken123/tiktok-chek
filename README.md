# TikTok Profile Checker

## Deploy ke Vercel
1. Extract ZIP ini.
2. Upload folder `tiktok-profile-checker` ke repository GitHub.
3. Import repository tersebut di Vercel lalu deploy.
4. Buka URL Vercel yang diberikan.

File `api/profile.js` bertindak sebagai endpoint backend/serverless supaya frontend tidak memanggil sumber data langsung dari browser.

## Catatan
- Lookup memakai endpoint publik pihak ketiga TikWM. Endpoint pihak ketiga bisa berubah, membatasi request, atau sewaktu-waktu tidak tersedia.
- Data negara, bahasa, tanggal pembuatan akun, dan ID tidak selalu tersedia dari sumber publik. UI akan menampilkan `tidak tersedia` jika datanya kosong.
- Ini untuk data profil publik; bukan untuk mengakses akun privat, pesan, atau data login.
- Jika ingin kestabilan produksi, ganti sumber di `api/profile.js` dengan provider API resmi/berizin yang mendukung lookup profil berdasarkan username.
