import prisma from "../config/prisma.js";

//create data
export const requestBorrowing = async (req, res) =>{
  try {
    const { assetId, tenggatWaktu, catatan, lokasiPenggunaanId } = req.body;
    const userId = req.user.id;

    //check sattus
    const asset = await prisma.asset.findUnique({
      where: { id: parseInt(assetId) }
    })

    if(!asset) {
      return res.status(404).json({status: 'error', message: 'Aset tidak ditemukan'})
    }

    if (asset.kondisi === 'RUSAK') {
      return res.status(400).json({ status: 'error', message: 'Aset dalam kondisi rusak dan tidak dapat dipinjam' });
    }

    if (asset.statusKetersediaan === 'DIALOKASIKAN') {
      return res.status(400).json({ status: 'error', message: 'Aset yang dialokasikan tidak dapat diajukan untuk peminjaman umum' });
    }

    if (asset.statusKetersediaan !== 'TERSEDIA') {
      return res.status(400).json({status: 'error', message: 'Aset tidak tersedia untuk dipinjam'})  
    }

    //request borrowing
    const borrowing = await prisma.borrowing.create({
      data: {
        userId: userId,
        assetId: parseInt(assetId),
        lokasiPenggunaanId: lokasiPenggunaanId ? parseInt(lokasiPenggunaanId) : null,
        tanggalPinjam: new Date(),
        tenggatWaktu: new Date(tenggatWaktu),
        statusPeminjaman: 'PENDING',
        catatan: catatan
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Permintaan pinjaman berhasil diajukan',
      data: borrowing
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengajukan pinjaman'
    });
  }
};

//update borrowing status
export const approveBorrowing = async (req, res) => {
  try {
    const { id } = req.params;
    
    //validate borrowing data and asset availability
    const borrowing = await prisma.borrowing.findUnique({
      where: { id: parseInt(id) },
      include: { asset: true }
    });
    if(!borrowing || borrowing.statusPeminjaman !== 'PENDING'){
      return res.status(400).json({
        status: 'error',
        message: 'Data peminjaman tidak valid atau sudah diproses'
      });
    }

    if (borrowing.asset.kondisi === 'RUSAK') {
      return res.status(400).json({
        status: 'error',
        message: 'Aset dalam kondisi rusak dan tidak dapat disetujui untuk peminjaman'
      });
    }

    if (borrowing.asset.statusKetersediaan === 'DIALOKASIKAN') {
      return res.status(400).json({
        status: 'error',
        message: 'Aset ini telah dialokasikan dan tidak dapat disetujui untuk peminjaman umum'
      });
    }

    if (borrowing.asset.statusKetersediaan !== 'TERSEDIA') {
      return res.status(400).json({
        status: 'error',
        message: 'Aset saat ini tidak tersedia (mungkin sedang dipinjam atau dalam pemeliharaan)'
      });
    }

    const [updateBorrowing, updateAsset] = await prisma.$transaction([
      //changge transaction status 'aktif'
      prisma.borrowing.update({
        where: { id: parseInt(id) },
        data: { statusPeminjaman: 'AKTIF' }
      }),
      //change asset status 'dipinjam" and move physical location if requested
      prisma.asset.update({
        where: { id: borrowing.assetId },
        data: {
          statusKetersediaan: 'DIPINJAM',
          ...(borrowing.lokasiPenggunaanId ? { locationId: borrowing.lokasiPenggunaanId } : {})
        }
      }),
      // Auto-reject all other pending requests for this exact asset
      prisma.borrowing.updateMany({
        where: {
          assetId: borrowing.assetId,
          statusPeminjaman: 'PENDING',
          id: { not: parseInt(id) }
        },
        data: {
          statusPeminjaman: 'DITOLAK',
          catatan: 'Ditolak otomatis oleh sistem: Unit aset ini telah disetujui untuk peminjam lain terlebih dahulu (First-Come, First-Approved).'
        }
      })
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Permintaan pinjaman berhasil disetujui',
      data: { updateBorrowing, updateAsset }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Gagal menyetujui peminjaman'
    });
  }
};

// reject borrowing manually by admin/staff
export const rejectBorrowing = async (req, res) => {
  try {
    const { id } = req.params;
    const { catatan, alasan } = req.body;

    const borrowing = await prisma.borrowing.findUnique({
      where: { id: parseInt(id) }
    });

    if (!borrowing || borrowing.statusPeminjaman !== 'PENDING') {
      return res.status(400).json({
        status: 'error',
        message: 'Data peminjaman tidak valid atau sudah diproses'
      });
    }

    const updatedBorrowing = await prisma.borrowing.update({
      where: { id: parseInt(id) },
      data: {
        statusPeminjaman: 'DITOLAK',
        catatan: catatan || alasan || 'Ditolak oleh admin/staff'
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Permintaan pinjaman berhasil ditolak',
      data: updatedBorrowing
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Gagal menolak peminjaman'
    });
  }
};

//update return asset
export const returnAsset = async (req, res) => {
  try{
    const { id } = req.params;
    const { kondisiKembali, catatan } = req.body;

    const borrowing = await prisma.borrowing.findUnique({
      where: { id: parseInt(id) }
    });
    if(!borrowing || borrowing.statusPeminjaman !== 'AKTIF'){
      return res.status(400).json({
        status: 'error',
        message: 'Data peminjaman tidak valid atau sudah selesai'
      });
    }

    // Find Gudang Sarpras or fallback location to return asset home
    const gudangSarpras = await prisma.location.findFirst({
      where: { namaLokasi: { contains: 'Gudang Sarpras' } }
    });

    //update status
    const [finishedBorrowing, returnedAsset] = await prisma.$transaction([
      prisma.borrowing.update({
        where: { id: parseInt(id) },
        data: { 
          statusPeminjaman: 'SELESAI',
          tanggalKembali: new Date(),
          kondisiKembali: kondisiKembali || 'BAIK',
          catatan: catatan || borrowing.catatan
        }
      }),
      prisma.asset.update({
        where: { id: borrowing.assetId },
        data: {
          statusKetersediaan: 'TERSEDIA',
          kondisi: kondisiKembali || 'BAIK',
          ...(gudangSarpras ? { locationId: gudangSarpras.id } : {})
        }
      })
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Peminjaman berhasil diselesaikan',
      data: { finishedBorrowing, returnedAsset }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Gagal memproses pengembalian aset'
    });
  }
};

//borrowing history
export const getBorrowings = async (req, res) => {
  try {
    const filter = req.user.role === 'USER' ? { userId: req.user.id } : {};

    const borrowings = await prisma.borrowing.findMany({
      where: filter,
      include: {
        user: { select: { namaLengkap: true, nim: true } },
        asset: { select: { namaAset: true, kodeAset: true, locationId: true } },
        lokasiPenggunaan: { select: { id: true, namaLokasi: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.status(200).json({
      status: 'success',
      data: borrowings
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil riwayat peminjaman'
    });
  }
};