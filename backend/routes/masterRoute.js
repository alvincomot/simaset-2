import express from 'express';
import { verifyToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { getAllLocations, createLocation, updateLocation, deleteLocation } from '../controllers/locationController.js';

const router = express.Router();

//category routes
router.get('/categories', verifyToken, getAllCategories);
//admin area
router.post('/categories', verifyToken, authorizeRoles('SUPER_ADMIN', 'STAFF'), createCategory);
router.put('/categories/:id', verifyToken, authorizeRoles('SUPER_ADMIN', 'STAFF'), updateCategory);
router.delete('/categories/:id', verifyToken, authorizeRoles('SUPER_ADMIN', 'STAFF'), deleteCategory);

//location routes
router.get('/locations', verifyToken, getAllLocations);
//admin area
router.post('/locations', verifyToken, authorizeRoles('SUPER_ADMIN', 'STAFF'), createLocation);
router.put('/locations/:id', verifyToken, authorizeRoles('SUPER_ADMIN'  , 'STAFF'), updateLocation);
router.delete('/locations/:id', verifyToken, authorizeRoles('SUPER_ADMIN', 'STAFF'), deleteLocation);

export default router; 