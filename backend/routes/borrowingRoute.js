import express from 'express';
import { verifyToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import { requestBorrowing, approveBorrowing, returnAsset, getBorrowings } from '../controllers/borrowingController.js';

const router = express.Router();

//routes
router.get('/', verifyToken, getBorrowings);
router.post('/request', verifyToken, authorizeRoles('USER'), requestBorrowing);
//admion area
router.post('/approve/:id', verifyToken, authorizeRoles('SUPER_ADMIN', 'STAFF'), approveBorrowing);
router.post('/return/:id', verifyToken, authorizeRoles('SUPER_ADMIN', 'STAFF'), returnAsset);

export default router;