import User from "../../models/Users.js";
import Product from "../../models/Products.js";
import Order from "../../models/Orders.js";

export const getUser = async (req, res) => {
  try {
    const userId = req.userId || req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "User not found" });
  }
};

export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(201).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(201).json({ message: "User not found" });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000);

    user.resetPasswordToken = resetCode;
    await user.save();

    return res
      .status(200)
      .json({ message: "Check your email for verification code." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const checkToken = async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email) {
      return res.status(201).json({ message: "Email is required" });
    }

    if (!token) {
      return res.status(201).json({ message: "Code is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(201).json({ message: "User not found" });
    }

    if (user.resetPasswordToken != token) {
      return res.status(201).json({ message: "Code is incorrect" });
    }

    user.resetPasswordToken = Math.floor(100000 + Math.random() * 900000);

    await user.save();

    return res.status(200).json({
      message: "Code Verified, You're able now to change your password safely.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyUser = async (req, res, next) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    // Convert to plain object and remove sensitive fields
    const userObject = user.toObject();
    delete userObject.activation_code;
    delete userObject.isActivated;
    delete userObject.resetPasswordToken;
    delete userObject.suspended;
    delete userObject.hidden;

    return res.status(200).json({
      message: "OK",
      user: userObject,
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("wishlist.productId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract products while ensuring valid data
    let products = user.wishlist
      .map((item) => item.productId)
      .filter((product) => product); // Remove any null values

    return res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const isAlreadyInWishlist = user.wishlist.find(
      (item) => item.productId.toString() === productId
    );

    if (isAlreadyInWishlist) {
      user.wishlist = user.wishlist.filter(
        (item) => item.productId.toString() !== productId
      );

      await user.save();

      return res.json({ message: "Product removed from wishlist" });
    }

    user.wishlist.push({ productId });

    await user.save();

    return res.json({ message: "Product added to wishlist" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    user.wishlist = user.wishlist.filter(
      (item) => item.productId.toString() !== productId
    );

    await user.save();

    return res.json(user.wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await User.find({ userType: "supplier" });

    if (!suppliers) {
      return res.status(404).json({ message: "No suppliers found" });
    }

    return res.json(suppliers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const suppliersOrders = async (req, res) => {
  try {
    const userId = req.userId; // Assuming the userId comes from a middleware (authentication)
    
    // Fetch orders for the supplier
    const orders = await Order.find({ supplierId: userId }).populate('items.productId');

    // Optional: Aggregate some data (like total order value, status count, etc.)
    const totalOrders = orders.length;
    const totalAmount = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    const orderStatusCounts = orders.reduce((statusCount, order) => {
      statusCount[order.status] = (statusCount[order.status] || 0) + 1;
      return statusCount;
    }, {});

    // Optionally, you can add more aggregation or formatting here
    console.log("Fetched supplier orders:", orders);
    // Send response
    res.status(200).json({
      totalOrders,
      totalAmount,
      orderStatusCounts,
      orders,
    });

  } catch (error) {
    console.error('Error fetching supplier orders:', error);
    res.status(500).json({ message: 'Error fetching supplier orders' });
  }
};
  
          

