# Design Fitur Login

## 1. Tujuan

Memungkinkan pengguna masuk menggunakan NIM dan password melalui `POST /api/auth/login`, lalu diarahkan ke landing page sesuai role.

## 2. Route & API

- Route frontend: `/login`
- Endpoint: `POST /api/auth/login`
- Input UI: `nim`, `password`
- Output yang digunakan: JWT dan data user/role sesuai response backend.

## 3. Layout

### Desktop

Split layout 44/56:

- Kiri: brand SIMASET, headline, manfaat singkat, visual glass panel dengan ilustrasi aset abstrak.
- Kanan: form login di card max-width 440px.
- Background memakai gradient sangat halus indigo-cyan dengan noise/mesh opsional.

### Mobile

- Satu kolom.
- Visual panel diperkecil menjadi brand header dan accent gradient.
- Form card tanpa shadow berlebihan, padding 20px.

## 4. Isi Form

- Logo/wordmark SIMASET.
- Heading: “Selamat datang kembali”.
- Subheading: “Masuk menggunakan akun FTI UKSW Anda.”
- Field NIM:
  - input text, `inputMode="numeric"` bila format NIM numerik.
  - leading icon ID card.
  - autocomplete `username`.
- Field Password:
  - show/hide toggle.
  - autocomplete `current-password`.
- Link “Lupa password?” ke `/forgot-password`.
- Tombol “Masuk”.
- Caption keamanan: “Akses sistem disesuaikan dengan peran akun Anda.”

## 5. Validation

- NIM wajib diisi.
- Password wajib diisi.
- Jangan mengungkap apakah NIM terdaftar melalui pesan berbeda yang berisiko enumerasi akun; gunakan pesan umum dari backend.
- Trim whitespace NIM, jangan trim password.

## 6. States

### Loading

- Tombol menjadi “Memverifikasi…” dengan spinner.
- Field disabled selama submit.
- Tidak ada double submit.

### Error

- Kredensial salah: alert inline di atas form.
- Network error: toast “Tidak dapat terhubung ke server. Coba lagi.”
- Server error: pesan umum dan tombol coba lagi.

### Success

- Check micro-animation 300ms.
- Redirect:
  - `SUPER_ADMIN`, `STAFF` → `/dashboard`
  - `USER` → `/assets` atau `/home`
- Hormati `returnTo` hanya jika route aman dan role memiliki akses.

## 7. Visual Specs

- Form card: `rounded-3xl`, border tipis, surface 88% opacity, backdrop blur.
- Primary button full width, tinggi 46px.
- Focus ring indigo.
- Heading 30–32px desktop, 26–28px mobile.
- Logo tile menggunakan gradient indigo-violet.

## 8. Micro-interactions

- Card masuk dengan fade + translateY 8px selama 240ms.
- Password icon rotate/fade ringan saat toggle.
- Invalid field melakukan subtle horizontal nudge maksimal 4px, nonaktif pada reduced motion.
- Button active scale 0.98.

## 9. Accessibility & Security UI

- Error alert memakai `role="alert"`.
- Label eksplisit untuk semua input.
- Tombol show password memiliki `aria-pressed`.
- Jangan menyimpan password.
- Jangan menampilkan JWT pada UI/log.

## 10. Acceptance Criteria

- Login berhasil mengarahkan berdasarkan role.
- Loading state mencegah request ganda.
- Login dapat dilakukan penuh via keyboard.
- Form tetap nyaman pada layar 320px.
- Dark mode memiliki kontras yang baik.
