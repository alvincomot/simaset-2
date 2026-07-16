import express from "express";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  allocateAssets,
  relocateAssets,
  startMaintenance,
  finishMaintenance,
  getAllocationHistory,
  getLocationSummary,
  getAllocatedCatalogUser
} from "../controllers/allocationController.js";

const router = express.Router();

// H. Safe allocated catalog for USER (dapat diakses semua role yang login)
router.get("/user-catalog", verifyToken, getAllocatedCatalogUser);

// Admin / Staff only routes
router.post("/allocate", verifyToken, authorizeRoles("SUPER_ADMIN", "STAFF"), allocateAssets);
router.post("/relocate", verifyToken, authorizeRoles("SUPER_ADMIN", "STAFF"), relocateAssets);
router.post("/maintenance/start", verifyToken, authorizeRoles("SUPER_ADMIN", "STAFF"), startMaintenance);
router.post("/maintenance/finish", verifyToken, authorizeRoles("SUPER_ADMIN", "STAFF"), finishMaintenance);
router.get("/history", verifyToken, authorizeRoles("SUPER_ADMIN", "STAFF"), getAllocationHistory);
router.get("/location-summary", verifyToken, authorizeRoles("SUPER_ADMIN", "STAFF"), getLocationSummary);

export default router;
