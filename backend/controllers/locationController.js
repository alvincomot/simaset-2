import prisma from "../config/prisma.js";

//get all location data
export const getAllLocations = async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { namaLokasi: 'asc' }
    });
    res.status(200).json({ status: 'success', data: locations });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Gagal mengambil data lokasi'});
  }
};

//create location data
export const createLocation = async (req, res) => {
  try {
    const { namaLokasi, deskripsi } = req.body;
    if(!namaLokasi) return res.status(400).json({status: 'error', message: 'Nama lokasi wajib diisi'});

    const newLocation = await prisma.location.create({
      data: { namaLokasi, deskripsi }
    });
    res.status(201).json({status: 'success', data: newLocation});
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Gagal menambahkan lokasi'});
  }
};

//update location data
export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { namaLokasi, deskripsi } = req.body;
    
    const updatedLocation = await prisma.location.update({
      where: { id: parseInt(id) },
      data: { namaLokasi, deskripsi }
    });
    res.status(200).json({ status: 'success', data: updatedLocation});
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Gagal memperbarui lokasi'});
  }
};

//delete location data
export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const locationId = parseInt(id);

    // Cek apakah lokasi masih digunakan oleh aset (baik sebagai lokasi aktual maupun alokasi)
    const usedAssetsCount = await prisma.asset.count({
      where: {
        OR: [
          { locationId: locationId },
          { lokasiAlokasiId: locationId }
        ]
      }
    });

    if (usedAssetsCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Lokasi tidak dapat dihapus karena masih digunakan oleh aset (sebagai lokasi aktual atau lokasi alokasi)'
      });
    }

    await prisma.location.delete({ where: { id: locationId } });
    res.status(200).json({ status: 'success', message: 'Lokasi berhasil dihapus'});
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(400).json({ status: 'error', message: 'Lokasi tidak dapat dihapus karena masih memiliki data aset atau riwayat alokasi'});
    }
    res.status(500).json({ status: 'error', message: 'Gagal menghapus data lokasi'});
  }
};