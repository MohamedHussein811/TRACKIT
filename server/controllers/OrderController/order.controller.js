import Order from "../../models/Orders.js";
import Product from "../../models/Products.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.userId || req.body.userId; // Assuming userId is available in the request

    // Validating and preparing the order data
    const {
      supplierId,
      items,
      totalAmount,
      status = "pending",
      createdAt,
    } = req.body;

    // Check if all required fields are provided
    if (!supplierId || !items || !totalAmount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate that each product exists
    const productIds = items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== items.length) {
      return res
        .status(400)
        .json({ message: "One or more products not found" });
    }

    // Prepare the order object
    const orderData = {
      supplierId,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      totalAmount,
      status,
      createdAt: createdAt || new Date().toISOString(),
      userName: req.body.userName,
    };

    // Create the order in the database
    const newOrder = new Order(orderData);
    await newOrder.save();

    // Respond with success
    res
      .status(201)
      .json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    // Fetch all orders without filtering by userName
    const orders = await Order.find() // No userName filtering here
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .populate({
        path: "items.productId", // Use items.productId as the ref to populate product details
        select: "name category brand price stock images", // Specify the fields you want from the Product
      });

    const filteredOrders = orders.map((order) => {
      // Filter out items with null productId (if any)

      return order;
    });

    res.status(200).json({ orders: filteredOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: error.message });
  }
};
