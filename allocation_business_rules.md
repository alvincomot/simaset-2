# Aturan Bisnis Alokasi Aset — SIMASET

## 1. Status Dokumen

Dokumen ini adalah **sumber kebenaran utama** untuk fitur alokasi aset SIMASET. Semua desain frontend, perubahan backend, validasi, dan acceptance criteria terkait alokasi harus konsisten dengan keputusan di bawah ini.

Status keputusan: **disepakati**.

## 2. Definisi Resmi

> **Dialokasikan** adalah keadaan ketika aset ditempatkan secara semi-permanen pada satu lokasi atau ruangan tertentu untuk penggunaan operasional di lokasi tersebut. Aset tidak memiliki tenggat alokasi, tidak dapat dipinjam melalui peminjaman umum, dan tidak ditampilkan pada katalog User secara default.

Contoh:

- 25 komputer dialokasikan ke Lab Komputer 1.
- Proyektor permanen dialokasikan ke Ruang Seminar.
- Printer unit kerja dialokasikan ke Ruang Tata Usaha.

## 3. Batas Ruang Lingkup

Alokasi versi ini hanya berlaku untuk **lokasi atau ruangan**.

Tidak termasuk:

- alokasi kepada dosen atau individu;
- alokasi kepada organisasi mahasiswa;
- alokasi kepada proyek atau kegiatan;
- alokasi kepada unit organisasi sebagai penanggung jawab administratif.

Kebutuhan tersebut harus menjadi fitur terpisah seperti penugasan atau serah-terima aset karena memerlukan penerima, tanggung jawab, persetujuan, dan kemungkinan tenggat.

## 4. Keputusan Domain

1. Status ketersediaan baru adalah `DIALOKASIKAN`.
2. Alokasi bersifat semi-permanen dan tidak memiliki tanggal mulai atau tanggal berakhir yang direncanakan.
3. Setiap aset hanya boleh mempunyai satu alokasi aktif pada satu waktu.
4. Alokasi tidak memerlukan penanggung jawab ruangan.
5. Setiap aset tetap dikenali secara individual melalui kode aset unik.
6. Pemindahan antar-ruangan dilakukan langsung dalam satu tindakan; alokasi lama otomatis digantikan oleh alokasi baru.
7. Perubahan alokasi wajib tercatat dalam riwayat audit walaupun tidak memiliki tenggat.
8. Aset `DIALOKASIKAN` tidak dapat diajukan untuk peminjaman.
9. Validasi larangan peminjaman harus dilakukan oleh backend, bukan hanya dengan menyembunyikan tombol frontend.
10. Aset `DIALOKASIKAN` tidak muncul pada katalog User secara default, tetapi dapat dilihat setelah User memilih filter Dialokasikan secara eksplisit.

## 5. Status, Kondisi, dan Lokasi

Ketiga konsep berikut tidak boleh dicampur:

### Status Ketersediaan

- `TERSEDIA`: tidak terikat alokasi dan dapat dipinjam jika kondisinya baik.
- `DIPINJAM`: berada dalam transaksi peminjaman aktif.
- `PEMELIHARAAN`: sedang diservis atau diperiksa dan tidak dapat digunakan.
- `DIALOKASIKAN`: ditempatkan untuk penggunaan semi-permanen pada satu lokasi dan tidak dapat dipinjam.

### Kondisi Aset

- `BAIK`
- `RUSAK`

Kondisi fisik bersifat terpisah dari status ketersediaan. Aset dialokasikan dapat tercatat rusak, tetapi aset rusak tidak boleh dianggap siap digunakan.

### Dua Makna Lokasi

- **Lokasi alokasi:** ruangan tujuan tetap/semi-permanen tempat aset seharusnya digunakan.
- **Lokasi aktual:** lokasi fisik aset saat ini.

Dalam kondisi normal `DIALOKASIKAN`, lokasi aktual sama dengan lokasi alokasi. Saat pemeliharaan, lokasi aktual berubah ke ruang servis tetapi lokasi alokasi tetap tersimpan sebagai tujuan pengembalian.

Nama field teknis harus mengikuti implementasi backend aktual. Frontend tidak boleh mengasumsikan bahwa satu field lokasi dapat mewakili kedua konsep saat pemeliharaan.

## 6. Matriks Aturan Utama

| Keadaan aset | Lokasi aktual | Lokasi alokasi | Dapat dipinjam | Tampil default User |
|---|---|---|:---:|:---:|
| `TERSEDIA` + `BAIK` | Lokasi penyimpanan/aktual | Tidak ada | Ya | Ya |
| `DIALOKASIKAN` + `BAIK` | Ruangan alokasi | Ruangan alokasi | Tidak | Tidak |
| `DIALOKASIKAN` + `RUSAK` | Ruangan alokasi | Ruangan alokasi | Tidak | Tidak |
| `PEMELIHARAAN` | Ruang servis | Tetap tersimpan bila sebelumnya dialokasikan | Tidak | Tidak |
| `DIPINJAM` | Mengikuti transaksi | Tidak boleh memiliki alokasi aktif | Tidak | Tidak |

## 7. Transisi yang Diizinkan

### Menjadi Dialokasikan

Aset dapat dialokasikan apabila:

- tidak sedang dipinjam;
- tidak sedang dalam pemeliharaan;
- lokasi tujuan valid;
- aset tidak memiliki alokasi aktif lain, atau proses yang dilakukan adalah relokasi atomik.

### Relokasi

`DIALOKASIKAN (Lab 1)` → `DIALOKASIKAN (Lab 2)`

Relokasi mengganti lokasi lama dan baru dalam satu proses utuh. Sistem tidak boleh meninggalkan aset tanpa lokasi karena kegagalan parsial.

### Masuk Pemeliharaan

`DIALOKASIKAN (Lab 1)` → `PEMELIHARAAN`

- lokasi alokasi tetap Lab 1;
- lokasi aktual menjadi ruang servis;
- aset tetap tidak dapat dipinjam.

### Selesai Pemeliharaan

Apabila kondisi hasil servis `BAIK`:

`PEMELIHARAAN` → `DIALOKASIKAN` dan lokasi aktual kembali ke lokasi alokasi.

Apabila kondisi hasil servis masih `RUSAK`:

- aset tetap `PEMELIHARAAN`;
- lokasi aktual tetap ruang servis;
- aksi tidak boleh menandai aset kembali operasional.

## 8. Pengembalian dari Servis

Aksi UI yang digunakan adalah:

> **Selesaikan Servis & Kembalikan ke [Nama Lokasi Alokasi]**

Aksi ini merupakan konfirmasi staff bahwa:

1. pekerjaan servis telah selesai;
2. kondisi hasil servis sudah diperiksa;
3. aset secara fisik telah dikembalikan ke lokasi alokasinya.

Sistem tidak melakukan pengembalian hanya berdasarkan berlalunya waktu. Tidak ada tenggat atau job otomatis berbasis tanggal.

## 9. Visibilitas untuk User

Katalog User secara default hanya menampilkan aset yang dapat dipinjam.

Saat filter `DIALOKASIKAN` dipilih secara eksplisit:

- tampilkan ringkasan berdasarkan jenis/kategori aset dan lokasi;
- tampilkan jumlah unit;
- tampilkan keterangan “Tidak tersedia untuk peminjaman umum”;
- jangan tampilkan kode aset individual;
- jangan tampilkan catatan servis, riwayat perpindahan, identitas staff, atau data operasional internal.

## 10. Audit Minimum

Setiap alokasi, relokasi, masuk servis, dan selesai servis harus menyimpan riwayat yang dapat ditelusuri oleh `SUPER_ADMIN` dan `STAFF`, minimal:

- aset;
- jenis kejadian;
- lokasi asal;
- lokasi tujuan;
- waktu kejadian;
- pengguna/staff yang melakukan;
- catatan opsional.

Riwayat bersifat append-only dari sisi UI dan tidak boleh diedit atau dihapus.

## 11. Cabut Alokasi

Alur mengubah aset `DIALOKASIKAN` kembali menjadi `TERSEDIA` belum ditetapkan secara lengkap dalam keputusan ini. Antigravity dan frontend tidak boleh mengarang tombol “Cabut Alokasi” atau transisinya. Fitur tersebut memerlukan keputusan terpisah mengenai lokasi tujuan, pemeriksaan kondisi, dan kapan aset benar-benar dapat dipinjam kembali.

## 12. Larangan Implementasi

- Jangan mengizinkan peminjaman aset `DIALOKASIKAN`.
- Jangan menghapus lokasi alokasi saat aset masuk servis.
- Jangan mengembalikan aset rusak sebagai aset operasional.
- Jangan menampilkan semua aset dialokasikan satu per satu pada katalog User.
- Jangan memperluas alokasi menjadi penugasan kepada orang, unit, organisasi, atau proyek.
- Jangan mengaktifkan frontend sebelum backend menyediakan kontrak yang cukup untuk menjaga aturan ini secara server-side.
