import prisma from "../config/prisma.js";

//create data
export const requestBorrowing = async (req, res) =>{
  try {
    const { assetId, tenggatWaktu, catatan } = req.body;
    const userId = req.user.id;

    //check sattus
    const asset = await prisma.asset.findUnique({
      where: { id: parseInt(assetId) }
    })

    if(!asset) {
      return res.status(404).json({status: 'error', message: 'Aset tidak ditemukan'})
    }

    if (asset.statusKetersediaan !== 'TERSEDIA') {
      return res.status(400).json({status: 'error', message: 'Aset tidak tersedia untuk dipinjam'})  
    }

    //request borrowing
    const borrowing = await prisma.borrowing.create({
      data: {
        userId: userId,
        assetId: parseInt(assetId),
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
    
    //validate borrowing data
    const borrowing = await prisma.borrowing.findUnique({
      where: { id: parseInt(id) }
    });
    if(!borrowing || borrowing.statusPeminjaman !== 'PENDING'){
      return res.status(400).json({
        status: 'error',
        message: 'Data peminjaman tidak valid atau sudah diproses'
      });
    }

    const [updateBorrowing, updateAsset] = await prisma.$transaction([
      //changge transaction status 'aktif'
      prisma.borrowing.update({
        where: { id: parseInt(id) },
        data: { statusPeminjaman: 'AKTIF' }
      }),
      //change asset status 'dipinjam"
      prisma.asset.update({
        where: { id: borrowing.assetId },
        data: { statusKetersediaan: 'DIPINJAM' }
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

    //update status
    const [finishedBorrowing, returnAsset] = await prisma.$transaction([
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
          kondisi: kondisiKembali || 'BAIK'
        }
      })
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Peminjaman berhasil diselesaikan',
      data: { finishedBorrowing, returnAsset }
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
        asset: { select: { namaAset: true, kodeAset: true } }
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