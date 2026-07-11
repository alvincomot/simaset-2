import jwt from 'jsonwebtoken';

//auth
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if(!token) {
    return res.status(401).json({
      status: "error",
      message: "Akses ditolak. Token otorisasi tidak ditemukan",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      status: "error",
      message: "Akses ditolak. Token tidak valid atau kadaluarsa"
    });
  }
};

//auth role
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Anda tidak memiliki akses untuk melakukan operasi ini'
      });
    }
    next();
  };
};