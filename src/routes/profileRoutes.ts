import { Router } from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  exportData,
  deleteAccount,
} from "../controllers/profileController";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.get("/", verifyToken, getProfile);
router.put("/", verifyToken, updateProfile);
router.put("/password", verifyToken, changePassword);
router.get("/export", verifyToken, exportData);
router.delete("/", verifyToken, deleteAccount);

export default router;
