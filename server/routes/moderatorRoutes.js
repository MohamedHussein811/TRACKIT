import { Router } from "express";

import {
  allOrders,
  changeOrderStatus,
  getDashboardStats,
} from "../controllers/ModeratorController/moderator.controller.js";

const router = Router();

router.get(
  "/moderator/dashboard",
  getDashboardStats
);
router.get("/moderator/orders", allOrders);
router.put(
  "/supplier/orders/update-status",
  changeOrderStatus
);

export default router;
