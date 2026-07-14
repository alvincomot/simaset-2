import prisma from "../config/prisma.js";

// get all asset data
export const getAllAssets = async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        category: { select: { namaKategori: true }},
        location: { select: { namaLokasi: true }}
      },
      orderBy: {createdAt: 'desc' }
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
        borrowings: {
          include: { user: { select: { nim: true, namaLengkap: true } } }
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
    
    const existingAsset = await prisma.asset.findUnique({ where: { id: parseInt(id) } });
    if (!existingAsset) {
      return res.status(404).json({ status: 'error', message: 'Aset tidak ditemukan'});
    }

    await prisma.asset.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      status: "success",
      message: "Aset berhasil dihapus",
    })
    
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(400).json({
        status: 'error',
        message: 'Aset tidak dapat dihapus karena masih memiliki riwayat peminjaman'
      });
    }
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

    res.status(200).json({
      status: 'success',
      data: { totalAssets, borrowedAssets, damageAssets,}
    });
  } catch (error) {
    console.error('Error getAssetStats: ', error);
    res.status(500).json({ status: 'error', message: 'Gagal mengambil data stats'});
  }
};