# Design Fitur Pengajuan Peminjaman

## 1. Tujuan

Memungkinkan role `USER` mengajukan peminjaman aset yang tersedia melalui `POST /api/borrowing/request`.

## 2. API

Payload konseptual:

```json
{
  "assetId": 123,
  "tenggatWaktu": "ISO_DATE",
  "catatan": "Tujuan/keperluan peminjaman"
}
```

Status awal dibuat server sebagai `PENDING`.

## 3. Entry Points

- CTA pada asset detail.
- CTA pada asset card dapat membuka detail terlebih dahulu agar user memahami aset.
- Route/modal: `/assets/:id/borrow` atau modal dari detail.

## 4. Eligibility UI

CTA aktif hanya bila:

- Role = `USER`.
- `statusKetersediaan = TERSEDIA`.
- Kondisi aset layak sesuai aturan produk, direkomendasikan `BAIK`.

Jika tidak eligible, tampilkan alasan, bukan tombol tanpa penjelasan. Aset `DIALOKASIKAN` selalu tidak eligible dan backend wajib menolak request langsung terhadap aset tersebut.

## 5. Form Layout

### Asset Summary

Card compact read-only:

- Nama dan kode aset.
- Kategori.
- Lokasi.
- Badge Tersedia dan Baik.

### Fields

- Tanggal pinjam: “Hari ini”/tanggal server, read-only.
- Tenggat waktu: date picker required, tanggal masa lalu disabled.
- Tujuan peminjaman: textarea yang dipetakan ke `catatan`.
- Checkbox konfirmasi opsional: “Saya bertanggung jawab menjaga aset selama masa peminjaman.” Ini hanya UI acknowledgement, bukan legal claim.

### Footer

- Batal.
- “Ajukan Peminjaman”.

## 6. Confirmation Step

Sebelum submit, bisa gunakan summary ringan dalam form yang sama:

- Aset.
- Tenggat.
- Tujuan.

Tidak perlu modal kedua jika menambah friction. Tombol submit harus eksplisit.

## 7. Success State

- Dedicated success panel.
- Status badge Pending.
- Message: permintaan menunggu persetujuan Staff/Admin.
- CTA “Lihat Pinjaman Saya”.
- CTA secondary “Kembali ke Katalog”.

## 8. Error Cases

- Asset sudah tidak tersedia akibat race condition: tampilkan alert dan refresh asset state.
- Asset ternyata `DIALOKASIKAN`: tampilkan “Aset ini merupakan fasilitas tetap ruangan dan tidak dapat dipinjam.”
- Tanggal invalid: inline error.
- `401/403`: session/access handling global.
- Server error: pertahankan catatan dan tenggat.

## 9. Responsive

- Desktop: modal 600px atau side drawer.
- Mobile: full-screen bottom sheet/dialog dengan sticky footer.
- Date picker harus nyaman pada touch.

## 10. Micro-interactions

- Asset summary fade-in.
- Date selection highlight smooth.
- Submit success check animation.
- Tidak menggunakan optimistic success sebelum server mengonfirmasi.

## 11. Acceptance Criteria

- Hanya USER dapat mengirim request.
- `assetId`, `tenggatWaktu`, dan `catatan` dipetakan benar.
- Tanggal pinjam tidak dapat diedit.
- Race condition asset unavailable ditangani jelas.
- Setelah sukses, status yang ditampilkan adalah Pending.
