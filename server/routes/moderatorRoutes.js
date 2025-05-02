import { Router } from "express";

import {
  allOrders,
  changeOrderStatus,
  getDashboardStats,
  editProduct,
} from "../controllers/ModeratorController/moderator.controller.js";

const router = Router();

router.post('/moderator/editproduct', editProduct);

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
