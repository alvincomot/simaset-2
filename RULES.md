## Git Workflow
*   Gunakan pesan commit yang jelas dan deskriptif.
*   Gunakan prefix standar untuk commit:
    *   `feat:` untuk penambahan fitur baru.
    *   `fix:` untuk perbaikan bug.
    *   `style:` untuk perubahan tampilan (Tailwind).
    *   `refactor:` untuk merapikan kode tanpa mengubah fungsi.

## Aturan Git (Version Control)
- **DILARANG KERAS** menggunakan `git add .` atau `git add -A` atau `git commit -a`.
- **SHORTCUT "commit"**: Jika user mengetik instruksi "commit", AI wajib menjalankan prosedur berikut secara otomatis:
  1. Melakukan deteksi file apa saja yang mengalami perubahan.
  2. Melakukan `git add <nama_file>` HANYA pada satu file secara spesifik.
  3. Melakukan `git commit -m "tipe: pesan"` untuk file tersebut.
  4. Ulangi langkah 2 dan 3 untuk semua file yang berubah (dilakukan secara satu-per-satu/individual file).
- **FORMAT COMMIT**: Gunakan bahasa Inggris yang baku dengan standar *Conventional Commits* (contoh: `feat:`, `fix:`, `style:`).
- **DILARANG MENGGUNAKAN SCOPE/KURUNG DI COMMIT**: Penulisan commit **wajib** murni langsung ke pesannya, tanpa menambahkan *scope* file di dalam kurung.
  - ✅ **BENAR**: `feat: add user registration form`
  - ❌ **SALAH**: `feat(Register): add user registration form` (Dilarang menggunakan kurung/scope nama file)