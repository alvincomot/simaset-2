import prisma from "../config/prisma.js";

// C. Single & Bulk Allocation
export const allocateAssets = async (req, res) => {
  try {
    const { assetIds, assetId, lokasiAlokasiId, catatan } = req.body;
    const userId = req.user.id;

    const ids = assetIds && Array.isArray(assetIds) ? assetIds : (assetId ? [assetId] : []);
    if (ids.length === 0 || !lokasiAlokasiId) {
      return res.status(400).json({
        status: 'error',
        message: 'Daftar assetId/assetIds dan lokasiAlokasiId wajib diisi'
      });
    }

    const targetLocation = await prisma.location.findUnique({
      where: { id: parseInt(lokasiAlokasiId) }
    });
    if (!targetLocation) {
      return res.status(404).json({ status: 'error', message: 'Lokasi alokasi tujuan tidak ditemukan' });
    }

    const numericIds = ids.map(id => parseInt(id));
    const assets = await prisma.asset.findMany({
      where: { id: { in: numericIds } }
    });

    if (assets.length !== numericIds.length) {
      return res.status(404).json({ status: 'error', message: 'Satu atau lebih aset tidak ditemukan' });
    }

    // Validasi aturan domain sebelum mutasi
    for (const asset of assets) {
      if (asset.statusKetersediaan === 'DIPINJAM') {
        return res.status(400).json({
          status: 'error',
          message: `Aset ${asset.namaAset} (${asset.kodeAset}) sedang dipinjam dan tidak dapat dialokasikan`
        });
      }
      if (asset.statusKetersediaan === 'PEMELIHARAAN') {
        return res.status(400).json({
          status: 'error',
          message: `Aset ${asset.namaAset} (${asset.kodeAset}) sedang dalam pemeliharaan dan tidak dapat dialokasikan`
        });
      }
      if (asset.statusKetersediaan === 'DIALOKASIKAN' && asset.lokasiAlokasiId !== parseInt(lokasiAlokasiId)) {
        return res.status(400).json({
          status: 'error',
          message: `Aset ${asset.namaAset} (${asset.kodeAset}) sudah dialokasikan. Gunakan fitur relokasi untuk memindahkannya.`
        });
      }
    }

    // Mutasi secara atomik
    const operations = [];
    for (const asset of assets) {
      operations.push(
        prisma.asset.update({
          where: { id: asset.id },
          data: {
            statusKetersediaan: 'DIALOKASIKAN',
            locationId: parseInt(lokasiAlokasiId),
            lokasiAlokasiId: parseInt(lokasiAlokasiId)
          }
        })
      );
      operations.push(
        prisma.allocation_history.create({
          data: {
            assetId: asset.id,
            userId: userId,
            jenisKejadian: 'ALOKASI',
            lokasiAsalId: asset.locationId,
            lokasiTujuanId: parseInt(lokasiAlokasiId),
            catatan: catatan || `Alokasi ke ${targetLocation.namaLokasi}`
          }
        })
      );
    }

    const results = await prisma.$transaction(operations);

    res.status(200).json({
      status: 'success',
      message: `${assets.length} aset berhasil dialokasikan ke ${targetLocation.namaLokasi}`,
      data: {
        allocatedCount: assets.length,
        targetLocation: targetLocation
      }
    });
  } catch (error) {
    console.error('Error allocateAssets:', error);
    res.status(500).json({ status: 'error', message: 'Gagal melakukan alokasi aset' });
  }
};

// D. Atomic Relocation
export const relocateAssets = async (req, res) => {
  try {
    const { assetIds, assetId, lokasiTujuanId, catatan } = req.body;
    const userId = req.user.id;

    const ids = assetIds && Array.isArray(assetIds) ? assetIds : (assetId ? [assetId] : []);
    if (ids.length === 0 || !lokasiTujuanId) {
      return res.status(400).json({
        status: 'error',
        message: 'Daftar assetId/assetIds dan lokasiTujuanId wajib diisi'
      });
    }

    const targetLocation = await prisma.location.findUnique({
      where: { id: parseInt(lokasiTujuanId) }
    });
    if (!targetLocation) {
      return res.status(404).json({ status: 'error', message: 'Lokasi tujuan relokasi tidak ditemukan' });
    }

    const numericIds = ids.map(id => parseInt(id));
    const assets = await prisma.asset.findMany({
      where: { id: { in: numericIds } }
    });

    if (assets.length !== numericIds.length) {
      return res.status(404).json({ status: 'error', message: 'Satu atau lebih aset tidak ditemukan' });
    }

    // Validasi aturan domain sebelum mutasi
    for (const asset of assets) {
      if (asset.statusKetersediaan === 'DIPINJAM') {
        return res.status(400).json({
          status: 'error',
          message: `Aset ${asset.namaAset} (${asset.kodeAset}) sedang dipinjam dan tidak dapat direlokasi`
        });
      }
      if (asset.statusKetersediaan === 'PEMELIHARAAN') {
        return res.status(400).json({
          status: 'error',
          message: `Aset ${asset.namaAset} (${asset.kodeAset}) sedang dalam pemeliharaan dan tidak dapat direlokasi sebelum selesai servis`
        });
      }
      if (asset.statusKetersediaan !== 'DIALOKASIKAN') {
        return res.status(400).json({
          status: 'error',
          message: `Aset ${asset.namaAset} (${asset.kodeAset}) belum berstatus DIALOKASIKAN. Gunakan alokasi terlebih dahulu.`
        });
      }
      if (asset.lokasiAlokasiId === parseInt(lokasiTujuanId) || asset.locationId === parseInt(lokasiTujuanId)) {
        return res.status(400).json({
          status: 'error',
          message: `Relokasi ke lokasi yang sama ditolak untuk aset ${asset.namaAset} (${asset.kodeAset})`
        });
      }
    }

    // Mutasi atomik relokasi
    const operations = [];
    for (const asset of assets) {
      operations.push(
        prisma.asset.update({
          where: { id: asset.id },
          data: {
            statusKetersediaan: 'DIALOKASIKAN',
            locationId: parseInt(lokasiTujuanId),
            lokasiAlokasiId: parseInt(lokasiTujuanId)
          }
        })
      );
      operations.push(
        prisma.allocation_history.create({
          data: {
            assetId: asset.id,
            userId: userId,
            jenisKejadian: 'RELOKASI',
            lokasiAsalId: asset.lokasiAlokasiId || asset.locationId,
            lokasiTujuanId: parseInt(lokasiTujuanId),
            catatan: catatan || `Relokasi atomik ke ${targetLocation.namaLokasi}`
          }
        })
      );
    }

    await prisma.$transaction(operations);

    res.status(200).json({
      status: 'success',
      message: `${assets.length} aset berhasil direlokasi ke ${targetLocation.namaLokasi}`,
      data: {
        relocatedCount: assets.length,
        targetLocation: targetLocation
      }
    });
  } catch (error) {
    console.error('Error relocateAssets:', error);
    res.status(500).json({ status: 'error', message: 'Gagal melakukan relokasi aset' });
  }
};

// E. Allocated Asset Maintenance Lifecycle - Masuk Servis
export const startMaintenance = async (req, res) => {
  try {
    let { assetId, lokasiServisId, catatan } = req.body;
    const userId = req.user.id;

    if (!assetId) {
      return res.status(400).json({
        status: 'error',
        message: 'assetId wajib diisi'
      });
    }

    const asset = await prisma.asset.findUnique({
      where: { id: parseInt(assetId) }
    });
    if (!asset) {
      return res.status(404).json({ status: 'error', message: 'Aset tidak ditemukan' });
    }

    // Jika lokasiServisId tidak dikirim/null, otomatis cari atau buat "Ruang Servis / Perbaikan"
    let serviceLocation = null;
    if (lokasiServisId) {
      serviceLocation = await prisma.location.findUnique({
        where: { id: parseInt(lokasiServisId) }
      });
    }
    if (!serviceLocation) {
      serviceLocation = await prisma.location.findFirst({
        where: {
          OR: [
            { namaLokasi: { contains: 'Servis' } },
            { namaLokasi: { contains: 'Perbaikan' } }
          ]
        }
      });
      if (!serviceLocation) {
        serviceLocation = await prisma.location.create({
          data: {
            namaLokasi: 'Ruang Servis / Perbaikan',
            deskripsi: 'Pusat pemeliharaan dan perbaikan aset'
          }
        });
      }
      lokasiServisId = serviceLocation.id;
    }

    if (asset.statusKetersediaan === 'DIPINJAM') {
      return res.status(400).json({ status: 'error', message: 'Aset sedang dipinjam dan tidak dapat masuk pemeliharaan' });
    }
    if (asset.statusKetersediaan === 'PEMELIHARAAN') {
      return res.status(400).json({ status: 'error', message: 'Aset sudah dalam status pemeliharaan' });
    }

    // Mutasi atomik: ubah lokasiAktual ke ruang servis, PERTAHANKAN lokasiAlokasiId
    const [updatedAsset, history] = await prisma.$transaction([
      prisma.asset.update({
        where: { id: asset.id },
        data: {
          statusKetersediaan: 'PEMELIHARAAN',
          locationId: parseInt(lokasiServisId)
          // lokasiAlokasiId sengaja tidak diubah/tetap tersimpan
        }
      }),
      prisma.allocation_history.create({
        data: {
          assetId: asset.id,
          userId: userId,
          jenisKejadian: 'MASUK_SERVIS',
          lokasiAsalId: asset.locationId,
          lokasiTujuanId: parseInt(lokasiServisId),
          catatan: catatan || `Masuk pemeliharaan di ${serviceLocation.namaLokasi}`
        }
      })
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Aset berhasil dimasukkan ke pemeliharaan/servis',
      data: { updatedAsset, history }
    });
  } catch (error) {
    console.error('Error startMaintenance:', error);
    res.status(500).json({ status: 'error', message: 'Gagal memulai pemeliharaan aset' });
  }
};

// E. Allocated Asset Maintenance Lifecycle - Selesai Servis
export const finishMaintenance = async (req, res) => {
  try {
    const { assetId, kondisiHasil, catatan } = req.body;
    const userId = req.user.id;

    if (!assetId || !kondisiHasil) {
      return res.status(400).json({
        status: 'error',
        message: 'assetId dan kondisiHasil (BAIK atau RUSAK) wajib diisi'
      });
    }

    if (!['BAIK', 'RUSAK'].includes(kondisiHasil)) {
      return res.status(400).json({ status: 'error', message: 'kondisiHasil harus BAIK atau RUSAK' });
    }

    const asset = await prisma.asset.findUnique({
      where: { id: parseInt(assetId) }
    });
    if (!asset) {
      return res.status(404).json({ status: 'error', message: 'Aset tidak ditemukan' });
    }

    if (asset.statusKetersediaan !== 'PEMELIHARAAN') {
      return res.status(400).json({ status: 'error', message: 'Aset sedang tidak berada dalam status pemeliharaan' });
    }

    let newStatus = asset.statusKetersediaan;
    let newActualLocation = asset.locationId;
    let targetLocationHistory = asset.locationId;

    if (kondisiHasil === 'BAIK') {
      // Jika hasil servis BAIK:
      // Kembali ke DIALOKASIKAN (dan lokasi aktual kembali ke lokasi alokasi) jika sebelumnya dialokasikan
      // Atau kembali ke TERSEDIA (dan lokasi aktual kembali ke lokasi asal sebelum servis) jika aset umum
      if (asset.lokasiAlokasiId) {
        newStatus = 'DIALOKASIKAN';
        newActualLocation = asset.lokasiAlokasiId;
        targetLocationHistory = asset.lokasiAlokasiId;
      } else {
        newStatus = 'TERSEDIA';
        const lastServisHistory = await prisma.allocation_history.findFirst({
          where: {
            assetId: asset.id,
            jenisKejadian: 'MASUK_SERVIS',
          },
          orderBy: { createdAt: 'desc' },
        });
        if (lastServisHistory && lastServisHistory.lokasiAsalId) {
          newActualLocation = lastServisHistory.lokasiAsalId;
          targetLocationHistory = lastServisHistory.lokasiAsalId;
        } else {
          newActualLocation = asset.locationId;
          targetLocationHistory = asset.locationId;
        }
      }
    } else {
      // Jika hasil servis masih RUSAK:
      // Tetap PEMELIHARAAN, lokasi aktual tetap di ruang servis, tidak boleh operasional
      newStatus = 'PEMELIHARAAN';
      newActualLocation = asset.locationId;
      targetLocationHistory = asset.locationId;
    }

    const [updatedAsset, history] = await prisma.$transaction([
      prisma.asset.update({
        where: { id: asset.id },
        data: {
          kondisi: kondisiHasil,
          statusKetersediaan: newStatus,
          locationId: newActualLocation
        }
      }),
      prisma.allocation_history.create({
        data: {
          assetId: asset.id,
          userId: userId,
          jenisKejadian: kondisiHasil === 'BAIK' ? 'SELESAI_SERVIS' : 'MASUK_SERVIS',
          lokasiAsalId: asset.locationId,
          lokasiTujuanId: targetLocationHistory,
          catatan: `Kondisi hasil servis: ${kondisiHasil}${catatan ? ' - ' + catatan : ''}`
        }
      })
    ]);

    res.status(200).json({
      status: 'success',
      message: kondisiHasil === 'BAIK' 
        ? 'Servis selesai. Aset kembali dalam kondisi BAIK dan operasional.'
        : 'Servis selesai dengan kondisi masih RUSAK. Aset tetap dalam status Pemeliharaan.',
      data: { updatedAsset, history }
    });
  } catch (error) {
    console.error('Error finishMaintenance:', error);
    res.status(500).json({ status: 'error', message: 'Gagal menyelesaikan pemeliharaan aset' });
  }
};

// F. Allocation and Maintenance History
export const getAllocationHistory = async (req, res) => {
  try {
    const { assetId, jenisKejadian } = req.query;

    const whereClause = {};
    if (assetId) whereClause.assetId = parseInt(assetId);
    if (jenisKejadian) whereClause.jenisKejadian = jenisKejadian;

    const history = await prisma.allocation_history.findMany({
      where: whereClause,
      include: {
        asset: { select: { kodeAset: true, namaAset: true, kondisi: true, statusKetersediaan: true } },
        user: { select: { nim: true, namaLengkap: true, role: true } },
        lokasiAsal: { select: { namaLokasi: true } },
        lokasiTujuan: { select: { namaLokasi: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      data: history
    });
  } catch (error) {
    console.error('Error getAllocationHistory:', error);
    res.status(500).json({ status: 'error', message: 'Gagal mengambil riwayat alokasi dan pemeliharaan' });
  }
};

// G. Location Summary
export const getLocationSummary = async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { namaLokasi: 'asc' },
      include: {
        assets: {
          select: { id: true, kondisi: true, statusKetersediaan: true }
        },
        allocatedAssets: {
          select: { id: true, kondisi: true, statusKetersediaan: true }
        }
      }
    });

    const summary = locations.map(loc => {
      const actualCount = loc.assets.length;
      const allocatedCount = loc.allocatedAssets.length;

      const baikCount = loc.assets.filter(a => a.kondisi === 'BAIK').length;
      const rusakCount = loc.assets.filter(a => a.kondisi === 'RUSAK').length;

      const tersediaCount = loc.assets.filter(a => a.statusKetersediaan === 'TERSEDIA').length;
      const dipinjamCount = loc.assets.filter(a => a.statusKetersediaan === 'DIPINJAM').length;
      const pemeliharaanCount = loc.assets.filter(a => a.statusKetersediaan === 'PEMELIHARAAN').length;
      const dialokasikanCount = loc.assets.filter(a => a.statusKetersediaan === 'DIALOKASIKAN').length;

      return {
        id: loc.id,
        namaLokasi: loc.namaLokasi,
        deskripsi: loc.deskripsi,
        totalActualAssets: actualCount,
        totalAllocatedAssets: allocatedCount,
        kondisi: {
          baik: baikCount,
          rusak: rusakCount
        },
        statusKetersediaan: {
          tersedia: tersediaCount,
          dipinjam: dipinjamCount,
          pemeliharaan: pemeliharaanCount,
          dialokasikan: dialokasikanCount
        }
      };
    });

    res.status(200).json({
      status: 'success',
      data: summary
    });
  } catch (error) {
    console.error('Error getLocationSummary:', error);
    res.status(500).json({ status: 'error', message: 'Gagal mengambil ringkasan lokasi' });
  }
};

// H. Safe Allocated Catalog for USER
export const getAllocatedCatalogUser = async (req, res) => {
  try {
    // Cari semua aset berstatus DIALOKASIKAN yang memiliki lokasiAlokasi dan category
    const allocatedAssets = await prisma.asset.findMany({
      where: { statusKetersediaan: 'DIALOKASIKAN' },
      select: {
        categoryId: true,
        lokasiAlokasiId: true,
        category: { select: { namaKategori: true } },
        lokasiAlokasi: { select: { namaLokasi: true, deskripsi: true } },
      },
    });

    const locationMap = {};
    for (const item of allocatedAssets) {
      if (!item.lokasiAlokasiId) continue;
      const locId = item.lokasiAlokasiId;
      if (!locationMap[locId]) {
        locationMap[locId] = {
          id: locId,
          namaLokasi: item.lokasiAlokasi?.namaLokasi || 'Tanpa Lokasi',
          deskripsi: item.lokasiAlokasi?.deskripsi || 'Fasilitas ruangan perkuliahan / laboratorium kampus.',
          totalAllocated: 0,
          categoriesMap: {},
        };
      }
      locationMap[locId].totalAllocated += 1;

      const catName = item.category?.namaKategori || 'Tanpa Kategori';
      if (!locationMap[locId].categoriesMap[catName]) {
        locationMap[locId].categoriesMap[catName] = {
          namaKategori: catName,
          jumlahUnit: 0,
        };
      }
      locationMap[locId].categoriesMap[catName].jumlahUnit += 1;
    }

    const aggregatedList = Object.values(locationMap)
      .map((loc) => ({
        id: loc.id,
        namaLokasi: loc.namaLokasi,
        deskripsi: loc.deskripsi,
        totalAllocated: loc.totalAllocated,
        categories: Object.values(loc.categoriesMap).sort((a, b) =>
          a.namaKategori.localeCompare(b.namaKategori)
        ),
        keterangan: 'Tidak tersedia untuk peminjaman umum',
      }))
      .sort((a, b) => a.namaLokasi.localeCompare(b.namaLokasi));

    res.status(200).json({
      status: 'success',
      data: aggregatedList,
    });
  } catch (error) {
    console.error('Error getAllocatedCatalogUser:', error);
    res.status(500).json({ status: 'error', message: 'Gagal mengambil katalog aset dialokasikan' });
  }
};
