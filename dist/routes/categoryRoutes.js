"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoryController_1 = require("../controllers/categoryController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Vérification du token pour toutes les routes
router.use(auth_1.verifyToken);
router.get("/", categoryController_1.getCategories);
router.post("/", categoryController_1.addCategory);
router.delete("/:id", categoryController_1.deleteCategory);
exports.default = router;
