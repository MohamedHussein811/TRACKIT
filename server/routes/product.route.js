import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken.js";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  featuredProducts,
} from "../controllers/ProductController/product.controller.js";

const router = Router();

router.post("/products", authenticateToken, createProduct);
router.get("/products", authenticateToken, getProducts);
router.get("/products/:id", getProductById);
router.put("/products/:id", authenticateToken, updateProduct);
router.delete("/products/:id", authenticateToken, deleteProduct);

router.get('/featured-products', featuredProducts);

export default router;
