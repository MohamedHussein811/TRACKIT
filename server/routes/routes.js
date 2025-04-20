import { Router } from "express";

//Routes
import moderatorRoutes from "./moderatorRoutes.js";
import userRoutes from "./userRoutes.js";
import productRoutes from "./product.route.js";
import orderRoutes from "./orderRoutes.js";
import eventRoutes from "./events.js";
import reservationRoutes from "./reservationRoutes.js";

const router = Router();
router.get("/", (req, res) => {
    res.json("404 Not Found");
});

router.use(moderatorRoutes);
router.use(userRoutes);
router.use(productRoutes);
router.use(orderRoutes);
router.use(eventRoutes)
router.use(reservationRoutes);


export default router;


