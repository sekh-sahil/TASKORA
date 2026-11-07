import { Router } from "express";
import protect from "../middleware/authMiddleware.js";
import { stats } from "../controllers/dashboardController.js";
const router = Router();
router.get("/stats", protect, stats);
export default router;