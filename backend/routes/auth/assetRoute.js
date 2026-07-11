import express from "express";
import { getAllAssets, createAsset } from '../controllers/assetController.js;'
import { verifyToken, authorizeRoles } from '../middlewares/auth/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getAllAssets);
router.post('/', verifyToken, authorizeRoles('SUPER_ADMIN', 'STAFF'), createAsset);

export default router;