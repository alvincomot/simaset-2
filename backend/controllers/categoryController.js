import prisma from "../config/prisma.js";

//get all category data
export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy:{ namaKategori:'asc' }
    });
    res.status(200).json({ status: 'success', data: categories });    
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Gagal mengambi data'})
  }
};

//create category data
export const createCategory = async (req, res) => {
  try {
  const { namaKategori, deskripsi } = req.body;
  if(!namaKategori) return res.status(400).json ({ status: 'error', message: 'Nama kategori wajib diisi'});

  const newCategory = await prisma.category.create({
    data: { namaKategori, deskripsi }
  });
  res.status(201).json({ status: 'success', data: newCategory});

  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Gagal menambahkan kategori'})
  }
};

//update category data
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { namaKategori, deskripsi } = req.body;
    
    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { namaKategori, deskripsi }
    });
    res.status(200).json({ status: 'success', data: updatedCategory});
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Gagal memperbarui kategori'})
  }
};

//delete category data
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ status: 'success', message: 'Kategori berhasil dihapus'});
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Kategori tidak dapat dihapus karena masih memiliki data aset'
      });
    }
    res.status(500).json({ status: 'error', message: 'Gagal menghapus data kategori'})
  }
};
