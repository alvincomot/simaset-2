import prisma from "../config/prisma.js";
import {
  allocateAssets,
  relocateAssets,
  startMaintenance,
  finishMaintenance,
  getAllocationHistory,
  getLocationSummary,
  getAllocatedCatalogUser
} from "../controllers/allocationController.js";
import { requestBorrowing, approveBorrowing } from "../controllers/borrowingController.js";
import { deleteLocation } from "../controllers/locationController.js";

// Helper mock untuk Express req & res
function createMockReqRes(body = {}, params = {}, query = {}, user = { id: 1, role: 'SUPER_ADMIN', nim: 'adm001' }) {
  const req = { body, params, query, user };
  let statusCode = 200;
  let responseData = null;

  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      responseData = data;
      return res;
    },
    getStatusCode: () => statusCode,
    getResponseData: () => responseData
  };
  return { req, res };
}

async function runTests() {
  console.log("=====================================================");
  console.log("   MEMULAI INTEGRATION & REGRESSION TEST ALOKASI   ");
  console.log("=====================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = "") {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    // 0. Setup data tes (User, Category, Locations, Assets)
    let adminUser = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: { nim: `admin_${Date.now()}`, namaLengkap: 'Admin Test', password: 'hash', role: 'SUPER_ADMIN' }
      });
    }

    let studentUser = await prisma.user.findFirst({ where: { role: 'USER' } });
    if (!studentUser) {
      studentUser = await prisma.user.create({
        data: { nim: `user_${Date.now()}`, namaLengkap: 'Student Test', password: 'hash', role: 'USER' }
      });
    }

    const category = await prisma.category.create({
      data: { namaKategori: `Kat_Test_${Date.now()}`, deskripsi: 'Kategori pengujian alokasi' }
    });

    const lab1 = await prisma.location.create({
      data: { namaLokasi: `Lab 1 Test_${Date.now()}`, deskripsi: 'Ruang Lab 1' }
    });

    const lab2 = await prisma.location.create({
      data: { namaLokasi: `Lab 2 Test_${Date.now()}`, deskripsi: 'Ruang Lab 2' }
    });

    const ruangServis = await prisma.location.create({
      data: { namaLokasi: `Ruang Servis_${Date.now()}`, deskripsi: 'Tempat servis perbaikan' }
    });

    const asset1 = await prisma.asset.create({
      data: {
        kodeAset: `AST-TEST-1-${Date.now()}`,
        namaAset: 'PC Lab A1',
        categoryId: category.id,
        locationId: lab1.id,
        statusKetersediaan: 'TERSEDIA'
      }
    });

    const asset2 = await prisma.asset.create({
      data: {
        kodeAset: `AST-TEST-2-${Date.now()}`,
        namaAset: 'PC Lab A2',
        categoryId: category.id,
        locationId: lab1.id,
        statusKetersediaan: 'TERSEDIA'
      }
    });

    // TEST 1: Single Allocation
    const { req: req1, res: res1 } = createMockReqRes({ assetId: asset1.id, lokasiAlokasiId: lab1.id, catatan: 'Alokasi awal PC 1' }, {}, {}, adminUser);
    await allocateAssets(req1, res1);
    const updatedAsset1 = await prisma.asset.findUnique({ where: { id: asset1.id } });
    assert(res1.getStatusCode() === 200 && updatedAsset1.statusKetersediaan === 'DIALOKASIKAN' && updatedAsset1.lokasiAlokasiId === lab1.id, "TEST 1: Single Allocation sukses & status DIALOKASIKAN");

    // TEST 2: Bulk Allocation
    const { req: req2, res: res2 } = createMockReqRes({ assetIds: [asset2.id], lokasiAlokasiId: lab1.id, catatan: 'Bulk alokasi' }, {}, {}, adminUser);
    await allocateAssets(req2, res2);
    const updatedAsset2 = await prisma.asset.findUnique({ where: { id: asset2.id } });
    assert(res2.getStatusCode() === 200 && updatedAsset2.statusKetersediaan === 'DIALOKASIKAN' && updatedAsset2.lokasiAlokasiId === lab1.id, "TEST 2: Bulk Allocation sukses & status DIALOKASIKAN");

    // TEST 3: Borrowing Protection on Allocated Asset (Menolak Peminjaman Aset DIALOKASIKAN)
    const { req: req3, res: res3 } = createMockReqRes({ assetId: asset1.id, tenggatWaktu: new Date(Date.now() + 86400000).toISOString(), catatan: 'Mau pinjam PC Lab' }, {}, {}, studentUser);
    await requestBorrowing(req3, res3);
    assert(res3.getStatusCode() === 400 && res3.getResponseData().message.includes('dialokasikan'), "TEST 3: Borrowing protection menolak pengajuan pinjaman aset DIALOKASIKAN");

    // TEST 4: Atomic Relocation dari Lab 1 ke Lab 2
    const { req: req4, res: res4 } = createMockReqRes({ assetIds: [asset1.id, asset2.id], lokasiTujuanId: lab2.id, catatan: 'Pindah ke Lab 2' }, {}, {}, adminUser);
    await relocateAssets(req4, res4);
    const rel1 = await prisma.asset.findUnique({ where: { id: asset1.id } });
    const rel2 = await prisma.asset.findUnique({ where: { id: asset2.id } });
    assert(res4.getStatusCode() === 200 && rel1.locationId === lab2.id && rel1.lokasiAlokasiId === lab2.id && rel2.lokasiAlokasiId === lab2.id, "TEST 4: Atomic Relocation memindahkan lokasiAktual & lokasiAlokasi bersamaan");

    // TEST 5: Relokasi ke lokasi yang sama ditolak
    const { req: req5, res: res5 } = createMockReqRes({ assetIds: [asset1.id], lokasiTujuanId: lab2.id }, {}, {}, adminUser);
    await relocateAssets(req5, res5);
    assert(res5.getStatusCode() === 400 && res5.getResponseData().message.includes('sama'), "TEST 5: Relokasi ke lokasi yang sama ditolak server");

    // TEST 6: Masuk Servis (Maintenance Lifecycle) - Pertahankan lokasiAlokasi & ubah lokasiAktual
    const { req: req6, res: res6 } = createMockReqRes({ assetId: asset1.id, lokasiServisId: ruangServis.id, catatan: 'Kipas bunyi keras' }, {}, {}, adminUser);
    await startMaintenance(req6, res6);
    const maint1 = await prisma.asset.findUnique({ where: { id: asset1.id } });
    assert(res6.getStatusCode() === 200 && maint1.statusKetersediaan === 'PEMELIHARAAN' && maint1.locationId === ruangServis.id && maint1.lokasiAlokasiId === lab2.id, "TEST 6: Masuk servis mengubah lokasiAktual ke ruang servis tetapi mempertahankan lokasiAlokasi (Lab 2)");

    // TEST 7: Selesai Servis dengan kondisi BAIK -> kembali ke DIALOKASIKAN & lokasiAlokasi
    const { req: req7, res: res7 } = createMockReqRes({ assetId: asset1.id, kondisiHasil: 'BAIK', catatan: 'Ganti kipas baru' }, {}, {}, adminUser);
    await finishMaintenance(req7, res7);
    const fin1 = await prisma.asset.findUnique({ where: { id: asset1.id } });
    assert(res7.getStatusCode() === 200 && fin1.statusKetersediaan === 'DIALOKASIKAN' && fin1.locationId === lab2.id && fin1.kondisi === 'BAIK', "TEST 7: Selesai servis kondisi BAIK mengembalikan aset ke DIALOKASIKAN & lokasi alokasi (Lab 2)");

    // TEST 8: Masuk servis lagi & Selesai Servis dengan kondisi RUSAK -> tetap PEMELIHARAAN & tidak boleh operasional
    const { req: req8a, res: res8a } = createMockReqRes({ assetId: asset2.id, lokasiServisId: ruangServis.id, catatan: 'Motherboard mati' }, {}, {}, adminUser);
    await startMaintenance(req8a, res8a);
    const { req: req8b, res: res8b } = createMockReqRes({ assetId: asset2.id, kondisiHasil: 'RUSAK', catatan: 'Suku cadang kosong' }, {}, {}, adminUser);
    await finishMaintenance(req8b, res8b);
    const fin2 = await prisma.asset.findUnique({ where: { id: asset2.id } });
    assert(res8b.getStatusCode() === 200 && fin2.statusKetersediaan === 'PEMELIHARAAN' && fin2.locationId === ruangServis.id && fin2.kondisi === 'RUSAK' && fin2.lokasiAlokasiId === lab2.id, "TEST 8: Selesai servis kondisi RUSAK mempertahankan status PEMELIHARAAN di ruang servis (tidak boleh operasional)");

    // TEST 9: Allocation History Trail
    const { req: req9, res: res9 } = createMockReqRes({}, {}, { assetId: asset1.id }, adminUser);
    await getAllocationHistory(req9, res9);
    const historyData = res9.getResponseData().data;
    assert(res9.getStatusCode() === 200 && Array.isArray(historyData) && historyData.length >= 3, `TEST 9: Audit trail mencatat seluruh kejadian alokasi (${historyData.length} rekaman terverifikasi)`);

    // TEST 10: Safe Allocated Catalog for USER (teragregasi & aman)
    const { req: req10, res: res10 } = createMockReqRes({}, {}, {}, studentUser);
    await getAllocatedCatalogUser(req10, res10);
    const catalogData = res10.getResponseData().data;
    const hasIndividualCode = JSON.stringify(catalogData).includes(asset1.kodeAset);
    assert(res10.getStatusCode() === 200 && Array.isArray(catalogData) && !hasIndividualCode, "TEST 10: Safe Allocated Catalog USER mengembalikan ringkasan teragregasi TANPA mengekspos kodeAset individual");

    // TEST 11: Location Summary
    const { req: req11, res: res11 } = createMockReqRes({}, {}, {}, adminUser);
    await getLocationSummary(req11, res11);
    const summaryData = res11.getResponseData().data;
    const lab2Summary = summaryData.find(s => s.id === lab2.id);
    assert(res11.getStatusCode() === 200 && lab2Summary && lab2Summary.totalAllocatedAssets >= 2, "TEST 11: Location Summary mengembalikan statistik akurat per lokasi");

    // TEST 12: Location Deletion Protection
    const { req: req12, res: res12 } = createMockReqRes({}, { id: lab2.id }, {}, adminUser);
    await deleteLocation(req12, res12);
    assert(res12.getStatusCode() === 400 && res12.getResponseData().message.includes('masih digunakan'), "TEST 12: Proteksi penghapusan lokasi yang masih digunakan sebagai lokasi alokasi/aktual");

    // Cleanup tes data
    await prisma.allocation_history.deleteMany({ where: { assetId: { in: [asset1.id, asset2.id] } } });
    await prisma.asset.deleteMany({ where: { id: { in: [asset1.id, asset2.id] } } });
    await prisma.location.deleteMany({ where: { id: { in: [lab1.id, lab2.id, ruangServis.id] } } });
    await prisma.category.delete({ where: { id: category.id } });

  } catch (err) {
    console.error("Terjadi error tak terduga selama pengujian:", err);
    failed++;
  } finally {
    await prisma.$disconnect();
    console.log("\n=====================================================");
    console.log(`          HASIL AKHIR: ${passed} PASS | ${failed} FAIL          `);
    console.log("=====================================================\n");
    if (failed > 0) process.exit(1);
  }
}

runTests();
