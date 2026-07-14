import express from "express";
import { getAllAssets, createAsset, updateAsset, deleteAsset, getAssetById, getAssetStats } from '../controllers/assetController.js';
import { verifyToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/stats', verifyToken, getAssetStats);
router.get('/', verifyToken, getAllAssets);
router.get('/:id', verifyToken, getAssetById);
router.post('/', verifyToken, authorizeRoles('SUPER_ADMIN', 'STAFF'), createAsset);
router.put('/:id', verifyToken, authorizeRoles('SUPER_ADMIN', 'STAFF'), updateAsset);
router.delete('/:id', verifyToken, authorizeRoles('SUPER_ADMIN', 'STAFF'), deleteAsset);

export default router;