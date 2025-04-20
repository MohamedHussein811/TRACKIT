import { Router } from "express";
import {
  authenticateToken,
} from "../middleware/authenticateToken.js";

import {
  allOrders,
  changeOrderStatus,
  getDashboardStats,
} from "../controllers/ModeratorController/moderator.controller.js";

const router = Router();

router.get(
  "/moderator/dashboard",
  authenticateToken,
  getDashboardStats
);
router.get("/moderator/orders", authenticateToken, allOrders);
router.put(
  "/supplier/orders/update-status",
  authenticateToken,
  changeOrderStatus
);

export default router;
