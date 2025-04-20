import { Router } from "express";
import {authenticateToken} from "../middleware/authenticateToken.js";
import { getSuppliers,suppliersOrders, verifyUser, getUser,checkEmail,checkToken,getWishlist,addToWishlist,removeFromWishlist } from "../controllers/UserController/get.UserController.js";
import { changePassword,resetPassword,updateUser,deleteUser} from "../controllers/UserController/update.UserController.js";
import { createUser, login, logout} from "../controllers/UserController/auth.UserController.js";
const router = Router();

router.get("/users/:id", getUser);
router.put("/updateuser", authenticateToken, updateUser);
router.post("/createUser", createUser);
router.post("/login", login);
router.post("/logout", logout);

router.get('/suppliers', getSuppliers);

router.get('/supplier/orders', authenticateToken, suppliersOrders);


router.get("/auth-status", authenticateToken, verifyUser);
router.get('/getuser', authenticateToken, getUser);


router.get('/wishlist', authenticateToken, getWishlist);
router.post('/wishlist', authenticateToken, addToWishlist);
router.delete('/wishlist/:id', authenticateToken, removeFromWishlist);

//Forgot Password
router.post("/checkemail", checkEmail);
router.post("/checktoken", checkToken);
router.post("/resetpassword", resetPassword);

// Change Password in Profile
router.post(
  "/changepassword",
  authenticateToken,
  changePassword
);

router.delete('/delete/user', authenticateToken, deleteUser);
export default router;
