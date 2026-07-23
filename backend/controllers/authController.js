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

    //cek verifikasi email
    if (user.isVerified === false) {
      return res.status(403).json({
        status: "error",
        message: `Akun Anda belum diverifikasi. Silakan periksa email student Anda (${user.nim}@student.uksw.edu) dan klik link verifikasi yang telah dikirimkan.`,
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
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

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
        from: `"SIMASET Universitas" <${process.env.EMAIL_USER}>`,
        to: targetEmail,
        subject: 'Permintaan Reset Password - SIMASET',
        html: `
            <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
              <h2 style="color: #4f46e5; text-align: center; margin-bottom: 10px;">Pemulihan Kata Sandi SIMASET</h2>
              <p style="color: #334155; font-size: 14px;">Halo <strong>${user.namaLengkap}</strong> (${user.nim}),</p>
              <p style="color: #334155; font-size: 14px; line-height: 1.6;">
                Kami menerima permintaan untuk mereset kata sandi akun Sistem Manajemen Aset (SIMASET) Anda. Untuk membuat kata sandi baru, silakan klik tombol di bawah ini:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Kata Sandi Sekarang</a>
              </div>
              <p style="color: #64748b; font-size: 12px;">Atau salin tautan berikut ke browser Anda:</p>
              <p style="color: #4f46e5; font-size: 12px; word-break: break-all;">${resetLink}</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="color: #94a3b8; font-size: 11px; text-align: center;">Tautan pemulihan kata sandi ini berlaku selama 10 menit.<br />Jika Anda tidak merasa meminta reset kata sandi, abaikan email ini dan akun Anda akan tetap aman.</p>
            </div>
          `,
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
};

export const register = async (req, res) => {
  try {
    const { nim, namaLengkap, password } = req.body;

    if (!nim || !namaLengkap || !password) {
      return res.status(400).json({
        status: "error",
        message: "NIM, Nama Lengkap, dan Password wajib diisi",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Password minimal 6 karakter",
      });
    }

    // Cek apakah NIM sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { nim },
    });

    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "NIM sudah terdaftar. Silakan login atau gunakan fitur Lupa Password.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

    const newUser = await prisma.user.create({
      data: {
        nim,
        namaLengkap,
        password: hashedPassword,
        role: "USER",
        isVerified: false,
        verificationToken,
        verificationTokenExpiry,
      },
    });

    const targetEmail = `${nim}@student.uksw.edu`;
    const verificationLink = `http://localhost:5173/verify-email/${verificationToken}`;

    console.log(`\n=============================================================`);
    console.log(`📧 [REGISTRASI BARU] Link Verifikasi untuk ${namaLengkap} (${targetEmail}):`);
    console.log(`➡️  ${verificationLink}`);
    console.log(`=============================================================\n`);

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: `"SIMASET Universitas" <${process.env.EMAIL_USER}>`,
          to: targetEmail,
          subject: "Aktivasi & Verifikasi Akun SIMASET",
          html: `
            <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
              <h2 style="color: #4f46e5; text-align: center; margin-bottom: 10px;">Selamat Datang di SIMASET</h2>
              <p style="color: #334155; font-size: 14px;">Halo <strong>${namaLengkap}</strong> (${nim}),</p>
              <p style="color: #334155; font-size: 14px; line-height: 1.6;">
                Terima kasih telah mendaftar di Sistem Manajemen Aset (SIMASET). Untuk mengaktifkan akun dan mulai mengajukan peminjaman fasilitas laboratorium, silakan klik tombol verifikasi di bawah ini:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verifikasi Akun Sekarang</a>
              </div>
              <p style="color: #64748b; font-size: 12px;">Atau salin tautan berikut ke browser Anda:</p>
              <p style="color: #4f46e5; font-size: 12px; word-break: break-all;">${verificationLink}</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="color: #94a3b8; font-size: 11px; text-align: center;">Tautan verifikasi ini berlaku selama 24 jam.<br />Jika Anda tidak merasa mendaftar, abaikan email ini.</p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email verifikasi berhasil dikirim ke ${targetEmail}`);
      } catch (emailErr) {
        console.log("Gagal mengirim email verifikasi:", emailErr.message);
      }
    }

    return res.status(201).json({
      status: "success",
      message: `Registrasi berhasil! Link verifikasi telah dikirimkan ke email student Anda (${targetEmail}).`,
      data: {
        id: newUser.id,
        nim: newUser.nim,
        namaLengkap: newUser.namaLengkap,
        email: targetEmail,
      },
    });
  } catch (error) {
    console.log("Error saat register:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan server saat pendaftaran akun.",
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        status: "error",
        message: "Token verifikasi tidak ditemukan.",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Token verifikasi tidak valid atau sudah kedaluwarsa.",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Akun berhasil diverifikasi, silakan login",
    });
  } catch (error) {
    console.log("Error saat verifikasi email:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan server saat memverifikasi email.",
    });
  }
};