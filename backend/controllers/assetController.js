import prisma from "../config/prisma.js";

// get all asset data
export const getAllAssets = async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        category: { select: { namaKategori: true } },
        location: { select: { namaLokasi: true } },
        lokasiAlokasi: { select: { namaLokasi: true } },
        allocationHistories: {
          where: { jenisKejadian: 'MASUK_SERVIS' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { lokasiAsal: { select: { namaLokasi: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      status: 'success',
      data: assets
    });
  } catch (error) {
    console.error("Error getAssets: ", error);
    res.status(500).json({ status: 'error', message: 'Terjadi kesalahan server.'});
  }
};

// get asset data by ID 
export const getAssetById = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await prisma.asset.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        location: true,
        lokasiAlokasi: true,
        borrowings: {
          include: { user: { select: { nim: true, namaLengkap: true } } }
        },
        allocationHistories: {
          include: {
            user: { select: { namaLengkap: true, nim: true } },
            lokasiAsal: { select: { namaLokasi: true } },
            lokasiTujuan: { select: { namaLokasi: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!asset) {
      return res.status(404).json({ status: 'error', message: 'Aset tidak ditemukan'});
    }

    res.status(200).json({ status: 'success', data: asset});
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Terjadi kesalahan server'});
  }
};

//create asset data
export const createAsset = async (req, res) => {
  try {
    const { namaAset, categoryId, locationId, kondisi } = req.body;

    //validasi input
    if (!namaAset || !categoryId || !locationId) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Semua input wajib diisi'});
    }

    //generate asset code
    const generateAssetCode = `FTI-AST-${Math.floor(Date.now() / 1000)}`;
    
    const newAsset = await prisma.asset.create({
      data: {
        kodeAset: generateAssetCode,
        namaAset: namaAset,
        categoryId: parseInt(categoryId),
        locationId: parseInt(locationId),
        kondisi: kondisi || 'BAIK',
        statusKetersediaan: 'TERSEDIA', 
      },
      include: { category: true, location: true }
    })

    res.status(201).json({
      status: 'success',
      message: 'Aset berhasil ditambahkan',
      data: newAsset
    });
  } catch (error) {
    console.error('Error createAsset: ', error);
    res.status(500).json({ status: 'error', message: 'Gagal menambah'})
  }
};

//update asset data
export const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { namaAset, categoryId, locationId, kondisi, statusKetersediaan } = req.body;

    const existingAsset = await prisma.asset.findUnique({ where: { id: parseInt(id) } });
    if (!existingAsset) {
      return res.status(404).json({ status: 'error', message: 'Aset tidak ditemukan' });
    }

    const updatedAsset = await prisma.asset.update({ 
      where: { id: parseInt(id) },
      data: {
        namaAset: namaAset || existingAsset.namaAset,
        categoryId: categoryId ? parseInt(categoryId) : existingAsset.categoryId,
        locationId: locationId ? parseInt(locationId) : existingAsset.locationId,
        kondisi: kondisi || existingAsset.kondisi,
        statusKetersediaan: statusKetersediaan || existingAsset.statusKetersediaan,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Data aset berhasil diupdate',
      data: updatedAsset
    });
  } catch (error) {
    console.error('Error updateAsset: ', error);
    res.status(500).json({ status: 'error', message: 'Gagal memperbarui data'})  
  }
};

// delete asset
export const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const assetId = parseInt(id);
    
    const existingAsset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!existingAsset) {
      return res.status(404).json({ status: 'error', message: 'Aset tidak ditemukan'});
    }

    // Cek apakah ada peminjaman yang MASIH AKTIF (PENDING atau AKTIF)
    const activeBorrowings = await prisma.borrowing.count({
      where: {
        assetId: assetId,
        statusPeminjaman: { in: ['PENDING', 'AKTIF'] }
      }
    });

    if (activeBorrowings > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Aset tidak dapat dihapus karena masih memiliki peminjaman aktif atau menunggu persetujuan'
      });
    }

    // Hapus semua riwayat peminjaman yang sudah SELESAI terlebih dahulu,
    // kemudian hapus aset dalam satu transaksi atomik
    await prisma.$transaction([
      prisma.borrowing.deleteMany({ where: { assetId: assetId } }),
      prisma.asset.delete({ where: { id: assetId } }),
    ]);

    res.status(200).json({
      status: "success",
      message: "Aset berhasil dihapus",
    })
    
  } catch (error) {
    console.error('Error deleteAsset: ', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal menghapus data aset'
    })  
  }
}

//summary
export const getAssetStats = async (req, res) => {
  try {
    const totalAssets = await prisma.asset.count();
    const borrowedAssets = await prisma.asset.count({ where: { statusKetersediaan: 'DIPINJAM' } });
    const damageAssets = await prisma.asset.count({ where: { kondisi: 'RUSAK' } });
    const allocatedAssets = await prisma.asset.count({ where: { statusKetersediaan: 'DIALOKASIKAN' } });

    res.status(200).json({
      status: 'success',
      data: { totalAssets, borrowedAssets, damageAssets, allocatedAssets }
    });
  } catch (error) {
    console.error('Error getAssetStats: ', error);
    res.status(500).json({ status: 'error', message: 'Gagal mengambil data stats'});
  }
};