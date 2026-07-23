import prisma from '../config/prisma.js';
import bcrypt from "bcrypt";
const saltRound = 10;

async function main() {
  console.log("Memulai proses seeding...");

  //seed super admin 
  const superAdminPassword = await bcrypt.hash("admin123", saltRound);
  const admin = await prisma.user.upsert({
    where: { nim: '01' }, 
    update: { password: superAdminPassword },
    create: {
      nim: '01',
      namaLengkap: 'SUPER ADMIN',
      password: superAdminPassword,
      role: 'SUPER_ADMIN'
    }
  });

  //seed staff admin
  const staffPassword = await bcrypt.hash("staff123", saltRound);
  const staff = await prisma.user.upsert({
    where: { nim: '02' },
    update: { password: staffPassword },
    create: {
      nim: '02',
      namaLengkap: 'STAFF ADMIN',
      password: staffPassword,
      role: 'STAFF'
    }
  });

  //seed user test
  const userPassword = await bcrypt.hash("user123", saltRound);
  const student = await prisma.user.upsert({
    where: { nim: '03' },
    update: { password: userPassword },
    create: {
      nim: '03',
      namaLengkap: 'USER TEST',
      password: userPassword,
      role: 'USER'
    }
  });

  //seed master data
  const categoriesData = [
    { namaKategori: 'Elektronik', deskripsi: 'Laptop, Proyektor, PC' },
    { namaKategori: 'Aksesoris', deskripsi: 'Kabel Converter, Adapter, Pointer' }
  ];
  for (const cat of categoriesData) {
    const existing = await prisma.category.findFirst({ where: { namaKategori: cat.namaKategori } });
    if (!existing) {
      await prisma.category.create({ data: cat });
    }
  }

  const locationsData = [
    { namaLokasi: 'Ruang Servis', deskripsi: 'Pusat pemeliharaan dan perbaikan aset' },
    { namaLokasi: 'Gudang Sarpras', deskripsi: 'Gudang utama penyimpanan aset operasional peminjaman umum kampus' },
    { namaLokasi: 'Lab Komputer 1', deskripsi: 'Ruang laboratorium perkuliahan dan praktikum komputer' },
    { namaLokasi: 'Ruang Dosen', deskripsi: 'Ruang transit dan kerja dosen FTI' }
  ];
  for (const loc of locationsData) {
    const existing = await prisma.location.findFirst({ where: { namaLokasi: loc.namaLokasi } });
    if (!existing) {
      await prisma.location.create({ data: loc });
    }
  }

  // Seed sample assets into Gudang Sarpras
  const gudangSarpras = await prisma.location.findFirst({ where: { namaLokasi: 'Gudang Sarpras' } });
  const catAksesoris = await prisma.category.findFirst({ where: { namaKategori: 'Aksesoris' } });
  const catElektronik = await prisma.category.findFirst({ where: { namaKategori: 'Elektronik' } });

  if (gudangSarpras && catAksesoris && catElektronik) {
    const sampleAssets = [
      {
        kodeAset: 'FTI-AST-1784424502',
        namaAset: 'Kabel Converter HDMI to VGA',
        categoryId: catAksesoris.id,
        locationId: gudangSarpras.id,
        kondisi: 'BAIK',
        statusKetersediaan: 'TERSEDIA'
      },
      {
        kodeAset: 'FTI-AST-PRJ-001',
        namaAset: 'Proyektor Portable Epson',
        categoryId: catElektronik.id,
        locationId: gudangSarpras.id,
        kondisi: 'BAIK',
        statusKetersediaan: 'TERSEDIA'
      }
    ];

    for (const ast of sampleAssets) {
      await prisma.asset.upsert({
        where: { kodeAset: ast.kodeAset },
        update: {
          namaAset: ast.namaAset,
          categoryId: ast.categoryId,
          locationId: ast.locationId,
          kondisi: ast.kondisi,
          statusKetersediaan: ast.statusKetersediaan
        },
        create: ast
      });
    }
  }

  console.log("Seeding selesai!");
  console.log("Super Admin: 01 / admin123");
  console.log("Staff: 02 / staff123");
  console.log("User: 03 / user123");

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });