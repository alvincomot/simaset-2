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
  await prisma.category.createMany({
        data: [
            { namaKategori: 'Elektronik', deskripsi: 'Laptop, Proyektor, PC' },
            { namaKategori: 'Furnitur', deskripsi: 'Meja, Kursi, Lemari' }
        ],
        skipDuplicates: true
    });

  await prisma.location.createMany({
      data: [
          { namaLokasi: 'Lab Komputer 1', deskripsi: 'Gedung FTI Lantai 2' },
          { namaLokasi: 'Ruang Dosen', deskripsi: 'Gedung FTI Lantai 1' }
      ],
      skipDuplicates: true
  });

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