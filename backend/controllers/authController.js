import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const login = async (req, res) => {
  try {
    const { nim, password } = req.body;

    //validasi input kosong
    if (!nim || !password) {
      return res.status(400).json({
        status: "error",
        message: "NIM dan Password wajib diisi",
      });
    }

    //cari user berdasarkan NIM
    const user = await prisma.user.findUnique({
      where: { nim: nim },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Akun dengan NIM tersebut tidak ditemukan.",
      });
    }

    //cek password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Password yang anda masukkan salah.",
      });
    }

    //generate JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        nim: user.nim,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.status(200).json({
      status: "success",
      message: "Login berhasil",
      data: {
        token: token,
        user: {
          id: user.id,
          nim: user.nim,
          namaLengkap: user.namaLengkap,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.log("Error saat login", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { nim } = req.body;

    //validasi input
    if (!nim) {
      return res.status(400).json({
        status: "error",
        message: "NIM wajib diisi",
      });
    }

    //check existing user
    const user = await prisma.user.findUnique({ where: { nim } });
    if (!user) {
      return res.status(404).json({ 
        status: "error",
        message: "NIM tidak terdaftar",
      })
    }

    //generate reset token & token expiry
    resetToken = crypto.randomBytes(32).toString('hex');
    tokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

    //update database 
    await prisma.user.update({
      where: { nim },
      data: { 
        resetToken: resetToken, 
        resetTokenExpiry: tokenExpiry 
      }
    });
    
    const targetEmail = `${nim}@student.uksw.edu`;
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: targetEmail,
        subject: 'Permintaan Reset Password - SIMASET',
        html: `
        Halo, ${user.namaLengkap}
        Kami menerima permintaan reset password untuk akun Anda.
        Klik tombol di bawah ini untuk membuat password baru. Link ini hanya berlaku selama 15 menit.
        <a href="${resetLink}">Reset Password</a>
        Jika Anda tidak merasa meminta reset password, abaikan email ini.
        `
      };
      await transporter.sendMail(mailOptions);
    } else {
      console.log(`[DEV MODE] EMAIL_PASS belum diatur di .env. Reset link untuk ${targetEmail}: ${resetLink}`);
    }

    res.status(200).json({
      status: 'success',
      message: `Link reset password berhasil dikirim ke ${targetEmail}`
    })
  } catch (error) {
    console.log('Error forgotPassword: ', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengirim email reset password'
    })
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    //validasi
    if (!newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Password baru wajib diisi",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });
    if(!user){
      return res.status(400).json({
        status: "error",
        message: "Token tidak valid atau sudah kedaluwarsa",
      });
    }

    //hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword, 
        resetToken: null,
        resetTokenExpiry: null 
      }
    });

    res.status(200).json({ 
      status: "success", 
      message: "Password berhasil di reset, Silahkan login kembali" 
    });
  } catch (error) {
    console.log('Error resetPassword:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Gagal mereset password' 
    });
  }
}