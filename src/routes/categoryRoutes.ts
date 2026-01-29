import express from "express";
import { getCategories, addCategory, deleteCategory } from "../controllers/categoryController";
import { verifyToken } from "../middleware/auth";

const router = express.Router();

// Vérification du token pour toutes les routes
router.use(verifyToken);

router.get("/", getCategories);
router.post("/", addCategory);
router.delete("/:id", deleteCategory);

export default router;
