import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken.js";
import {
    createOrder, getOrders,createUnitItemOrder
} from "../controllers/OrderController/order.controller.js";

const router = Router();

router.post("/order", authenticateToken, createOrder);
router.get("/order",getOrders);

router.post('/order/unitItem/:productId', createUnitItemOrder);

export default router;
