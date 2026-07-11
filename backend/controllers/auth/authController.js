import prisma from "../../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
    try {
      const { nim, password } = req.body;

      //validasi input kosong
      if(!nim || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'NIM dan Password wajib diisi',
        });
      }

      //cari user berdasarkan NIM
      const user = await prisma.user.findUnique({
        where: { nim:nim }
      })

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'Akun dengan NIM tersebut tidak ditemukan.',
        });
      }

      //cek password
      const isPasswordValid = await bcrypt.compare(password, user.password)

      if(!isPasswordValid){
        return res.status(401).json({
          status: 'error',
          message: 'Password yang anda masukkan salah.'
        })
      }

      //generate JWT Token
      const token = jwt.sign({
        id: user.id,
        nim: user.nim,
        role: user.role
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.status(200).json({
      status: 'success',
      message: 'Login berhasil',
      data: {
        token: token,
        user: {
          id: user.id,
          nim: user.nim,
          namaLengkap: user.namaLengkap,
          role: user.role
        }
      }
    })

    } catch (error) {
        console.log("Error saat login", error);
        return res.status(500).json({ 
          status: 'error',
          message: "Internal Server Error" 
        });
    }
}