# Design Fitur Lupa Password

## 1. Tujuan

Meminta link reset password melalui `POST /api/auth/forgot-password`. Identitas utama pada UI adalah NIM; sistem mengirim link ke alamat kampus yang terkait, mengikuti pola `NIM@student.uksw.edu`.

## 2. Route & API

- Route frontend: `/forgot-password`
- Endpoint: `POST /api/auth/forgot-password`
- Input yang direkomendasikan: NIM.
- Nama field payload harus mengikuti controller backend aktual.

## 3. Layout

Gunakan auth shell yang sama dengan login, tetapi form lebih ringkas:

- Back link “Kembali ke login”.
- Icon key/mail dalam tile cyan-indigo.
- Heading: “Atur ulang password”.
- Deskripsi singkat mengenai link berjangka 15 menit.

## 4. Form

- Field NIM.
- Preview email terproteksi setelah NIM valid secara format, contoh `6720•••••@student.uksw.edu`; jangan mengklaim akun ada.
- Tombol “Kirim link reset”.
- Informasi: periksa inbox dan folder spam.

## 5. Success State

Setelah server menerima request:

- Ganti form menjadi confirmation panel, bukan hanya toast.
- Icon check/mail.
- Heading: “Periksa email kampus Anda”.
- Pesan netral agar tidak membocorkan keberadaan akun.
- Tombol “Kembali ke login”.
- Optional cooldown visual untuk kirim ulang, hanya bila backend menerima request berulang.

## 6. Error States

- Format NIM invalid: inline error.
- `400`: tampilkan pesan backend yang aman.
- Network/server: alert dengan retry.
- Jangan menampilkan token reset dari response pada production UI.

## 7. Micro-interactions

- Peralihan form ke confirmation menggunakan crossfade 220ms.
- Icon check scale-in.
- Countdown, bila dipakai, menggunakan tabular numbers dan tidak perlu animasi setiap detik yang mencolok.

## 8. Acceptance Criteria

- Pengguna dapat kembali ke login tanpa kehilangan navigasi keyboard.
- Success state menjelaskan link berlaku 15 menit.
- UI tidak mengungkap apakah NIM terdaftar secara eksplisit.
- Layout konsisten dengan login dan mendukung dark mode.
