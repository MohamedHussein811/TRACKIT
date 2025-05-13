import { Router } from "express";

import {
  allOrders,
  changeOrderStatus,
  getDashboardStats,
  editProduct,
} from "../controllers/ModeratorController/moderator.controller.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

const router = Router();

router.post("/moderator/editproduct", editProduct);

router.get( "/moderator/dashboard", authenticateToken,getDashboardStats);
router.get("/moderator/orders", allOrders);
router.put("/supplier/orders/update-status", changeOrderStatus);

export default router;
