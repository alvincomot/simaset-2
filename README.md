# 📦 SIMASET (Sistem Informasi Manajemen Aset & Inventaris)

SIMASET adalah aplikasi web komprehensif yang dirancang untuk mendigitalkan proses pelacakan siklus hidup barang operasional (inventaris). Sistem ini dibangun untuk meminimalisir kehilangan barang, memudahkan pelacakan kondisi fisik (alokasi dan pemeliharaan), serta menangani sirkulasi peminjaman aset.

Sistem ini dioptimalkan khusus untuk ruang lingkup kampus (khususnya FTI UKSW), lengkap dengan validasi email domain institusi.

---

## ✨ Fitur Utama

- **🔐 Autentikasi Spesifik Kampus:** Login menggunakan NIM. Registrasi mewajibkan verifikasi via email domain `@student.uksw.edu`. (Dilengkapi fitur Reset Password).
- **👥 Role-Based Access Control (RBAC):**
  - **Super Admin & Staff (Manajer Aset):** Memiliki akses ke Dashboard analitik, manajemen master data (Kategori & Lokasi), manajemen inventaris, dan persetujuan ( *approval* ) peminjaman.
  - **User (Mahasiswa/Dosen):** Hanya dapat melihat katalog aset yang tersedia, meminjam aset, dan melihat riwayat peminjaman pribadi.
- **📦 Manajemen Sirkulasi Aset (Distribusi Fisik):**
  - **Alokasi & Relokasi:** Pemindahan barang dari gudang ke laboratorium/ruangan spesifik.
  - **Pemeliharaan (Servis):** Pencatatan status aset yang sedang dalam perbaikan.
  - **Audit Trail:** Segala aktivitas pergerakan aset (relokasi, servis) tercatat permanen di dalam riwayat untuk menjaga *traceability*.
- **🔄 Sistem Peminjaman (Borrowing System):**
  - Pengguna Biasa dapat melakukan *Request* pinjam.
  - Manajer Aset dapat melakukan verifikasi (Approve/Reject) dan mencatat kondisi fisik barang saat *Return* (Pengembalian).
- **📱 Responsif & Premium UI:** Dirancang secara modern menggunakan Tailwind CSS dengan dukungan transisi *glassmorphism*, kelancaran *mobile layout* (menggunakan *cards* pengganti tabel di layar kecil), dan dukungan *Dark Mode*.

---

## 🛠️ Tech Stack

### Frontend (User Interface)
- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS (dengan fitur kustomisasi tema terang/gelap)
- **Routing:** React Router DOM
- **Icons:** Lucide React

### Backend (Server & API)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MariaDB (MySQL)
- **ORM:** Prisma Client
- **Keamanan:** JSON Web Token (JWT) untuk session *stateless*, `bcrypt` untuk enkripsi password.
- **Mailer:** Nodemailer untuk verifikasi email OTP/Link.

---

## 🚀 Panduan Instalasi (Development)

Ikuti langkah-langkah di bawah ini untuk menjalankan SIMASET di lingkungan lokal (komputer Anda).

### Persiapan Prasyarat
1. Pastikan Anda telah menginstal **Node.js** (v18+).
2. Pastikan Anda telah menjalankan database **MySQL / MariaDB** di *localhost* Anda.

### 1. Setup Backend (Server)

Buka terminal dan navigasikan ke folder `backend`:
```bash
cd backend

# Instalasi dependensi
npm install

# Salin template environment variable
cp .env.example .env
```

Buka file `.env` yang baru dibuat dan sesuaikan kredensial koneksi Database (`DATABASE_URL`) serta Email SMTP Anda (untuk fitur Nodemailer).

```bash
# Lakukan migrasi database (membuat tabel-tabel di database)
npx prisma migrate dev --name init

# (Opsional) Jalankan Seeder untuk mengisi data awal (Dummy Admin, dll)
npm run seed

# Jalankan server backend
npm run start
# Atau gunakan "npm run dev" jika Anda menginstal nodemon secara global.
```
*Backend akan berjalan di `http://localhost:3000`*

### 2. Setup Frontend (Client)

Buka terminal baru dan navigasikan ke folder `frontend`:
```bash
cd frontend

# Instalasi dependensi
npm install

# Jalankan server frontend
npm run dev
```
*Frontend akan berjalan di `http://localhost:5173`*

---

## 📖 User Guide Singkat

1. **Memulai:** Buka aplikasi web di browser (`http://localhost:5173`).
2. **Sebagai Pengelola (Admin/Staff):**
   - Lakukan Login dengan akun Staff/Super Admin.
   - Buka menu **Data Master** untuk mengatur "Lokasi" ruangan laboratorium dan "Kategori" barang.
   - Buka menu **Aset & Inventaris** untuk mendaftarkan aset baru. Pilih beberapa aset dengan fitur *Batch Action* jika ingin memindahkan/mengalokasikan banyak barang sekaligus ke suatu lab.
3. **Sebagai Pengguna (Mahasiswa):**
   - Jika belum memiliki akun, klik "Daftar Akun", masukkan NIM dan alamat email (harus `@student.uksw.edu`).
   - Cek inbox email Anda, lalu klik tautan verifikasi.
   - Login, buka menu **Katalog Aset**, cari barang yang "Tersedia", dan klik icon kalender untuk melakukan *Request* Pinjam. Pantau status peminjaman Anda di menu "Pinjaman Saya".

---
*Dibuat untuk kebutuhan operasional manajemen inventaris. Pastikan untuk memperbarui variabel lingkungan SMTP untuk produksi nyata.*
