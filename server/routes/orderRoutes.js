import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken.js";
import {
    createOrder, getOrders
} from "../controllers/OrderController/order.controller.js";

const router = Router();

router.post("/order", authenticateToken, createOrder);
router.get("/order", authenticateToken, getOrders);

export default router;
