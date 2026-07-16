# Design Fitur Reset Password

## 1. Tujuan

Memperbarui password melalui token reset yang valid pada `POST /api/auth/reset-password/:token`.

## 2. Route & API

- Route frontend: `/reset-password/:token`
- Endpoint: `POST /api/auth/reset-password/:token`
- Input UI: password baru, konfirmasi password.
- Konfirmasi password hanya untuk validasi client dan tidak perlu dikirim bila backend tidak memerlukannya.

## 3. Initial Token State

Karena validitas token biasanya diketahui saat submit pada kontrak ini:

- Render form normal bila token ada di URL.
- Bila token kosong/malformed, tampilkan invalid state langsung.
- Setelah backend mengembalikan token invalid/expired, ganti menjadi dedicated expired panel.

## 4. Form

- Password baru.
- Konfirmasi password.
- Show/hide per field atau satu kontrol bersama yang jelas.
- Password strength indicator sederhana berdasarkan aturan backend, bukan klaim keamanan absolut.
- Checklist aturan password hanya menampilkan aturan yang benar-benar diterapkan backend.
- Tombol “Simpan password baru”.

## 5. States

### Success

- Confirmation panel dengan icon check.
- Pesan “Password berhasil diperbarui.”
- Tombol utama “Masuk sekarang”.
- Optional auto-redirect 3–5 detik, tetapi jangan memaksa tanpa tombol.

### Expired / Invalid

- Icon clock/error.
- Pesan token tidak valid atau kedaluwarsa.
- CTA “Minta link baru” ke forgot password.

### Loading

- Tombol mempertahankan lebar, text “Menyimpan…”.

## 6. Security UX

- Token tidak ditampilkan di layar.
- Jangan log URL penuh yang mengandung token.
- Setelah berhasil, bersihkan state form.
- Browser autocomplete: `new-password`.

## 7. Acceptance Criteria

- Mismatch password dicegah sebelum request.
- Token invalid menghasilkan state yang jelas.
- Success mengarahkan ke login.
- Form aksesibel dan bekerja pada mobile.
