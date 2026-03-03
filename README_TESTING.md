Panduan singkat uji Web App (GET & POST)

1) Persiapan
- Ganti `WEBAPP_URL` dengan URL hasil deploy Google Apps Script (contoh: https://script.google.com/macros/s/XXXXX/exec).
- Pastikan Web App dideploy dengan akses publik (Anyone, even anonymous) untuk pengujian tanpa OAuth.

2) Menggunakan skrip bash (Linux/macOS/Windows w/ WSL atau Git Bash):

```bash
# beri executable jika perlu
chmod +x test_webapp.sh
# jalankan
./test_webapp.sh https://script.google.com/macros/s/XXXXX/exec
# atau set environment variable
WEBAPP_URL=https://script.google.com/macros/s/XXXXX/exec ./test_webapp.sh
```

3) Menggunakan skrip PowerShell (Windows):

```powershell
# jalankan dari PowerShell
.\test_webapp.ps1 -Url "https://script.google.com/macros/s/XXXXX/exec"
# atau set env var
$env:WEBAPP_URL = "https://script.google.com/macros/s/XXXXX/exec"
.\test_webapp.ps1
```

4) Hasil yang diharapkan
- GET: JSON array murid yang dikembalikan `doGet`.
- POST: JSON respons `{ "success": true }` atau error JSON `{ "success": false, "error": "..." }`.

5) Catatan
- Jika Web App tidak publik, skrip akan gagal karena butuh autentikasi OAuth.
- `curl` langsung tidak terpengaruh oleh CORS. Browser mungkin perlu konfigurasi berbeda untuk menerima respons POST.
