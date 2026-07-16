# Design Fitur Master Kategori

## 1. Tujuan

CRUD data kategori aset untuk `SUPER_ADMIN` dan `STAFF` melalui `/api/masters/categories`.

## 2. Layout

- Page header: “Kategori Aset”.
- Description: “Kelompokkan aset agar pencarian dan pelaporan lebih terstruktur.”
- CTA: “Tambah Kategori”.
- Summary mini-card: jumlah kategori, bila dapat dihitung dari list.
- Table/list utama.

## 3. Table Columns

1. Nama kategori.
2. Deskripsi.
3. Jumlah aset hanya bila response menyediakannya; jangan mengarang.
4. Aksi.

Pada mobile, gunakan cards dengan nama, deskripsi 2–3 baris, dan kebab menu.

## 4. Create/Edit Form

- Nama kategori — required.
- Deskripsi — optional textarea, counter bila ada batas backend.
- Form dalam modal 520–560px.
- Title dinamis: Tambah/Edit Kategori.

## 5. Delete Behavior

- Confirm dialog menyebut nama kategori.
- Jika backend mengembalikan `400` karena kategori masih dipakai aset:
  - tampilkan error relasi inline.
  - jangan menghapus row secara optimistic.
  - arahkan user untuk memindahkan aset ke kategori lain terlebih dahulu.

## 6. Search & Sorting

- Search nama/deskripsi.
- Sort nama A–Z/Z–A client-side.
- Empty state untuk belum ada data dan no search result.

## 7. Visual & Motion

- Icon tag/folder pada empty state.
- Row baru highlight.
- Modal 220ms.
- Delete button destructive hanya di confirm dialog, kebab menu memakai text neutral.

## 8. Acceptance Criteria

- CRUD berhasil menggunakan endpoint kategori.
- Proteksi relasi 400 ditampilkan dengan bahasa yang mudah dipahami.
- Tidak ada menu kategori untuk USER.
- Form menjaga input saat server error.
