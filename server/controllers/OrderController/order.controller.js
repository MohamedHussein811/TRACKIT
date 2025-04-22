import Order from "../../models/Orders.js";
import Product from "../../models/Products.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.userId || req.body.userId;  // Assuming userId is available in the request

    // Validating and preparing the order data
    const { supplierId, items, totalAmount, status = 'pending', createdAt } = req.body;

    // Check if all required fields are provided
    if (!supplierId || !items || !totalAmount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate that each product exists
    const productIds = items.map(item => item.productId);
    const products = await Product.find({ '_id': { $in: productIds } });

    if (products.length !== items.length) {
      return res.status(400).json({ message: "One or more products not found" });
    }

    // Prepare the order object
    const orderData = {
      supplierId,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      totalAmount,
      status,
      createdAt: createdAt || new Date().toISOString(),
      userId,  // Assuming the user's ID is being sent or derived from the request
    };

    // Create the order in the database
    const newOrder = new Order(orderData);
    await newOrder.save();

    // Respond with success
    res.status(201).json({ message: 'Order created successfully', order: newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "products.productId",
        select: "name category brand price stock images",
        match: { _id: { $exists: true } },
      })
      .populate({
        path: "userId",
        select: "firstName lastName email phone",
      });

    const filteredOrders = orders.map((order) => {
      order.products = order.products.filter(
        (product) => product.productId !== null
      );
      return order;
    });

    res.status(200).json({ orders: filteredOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
