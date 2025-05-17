import Order from "../../models/Orders.js";
import Product from "../../models/Products.js";
import User from "../../models/Users.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.userId || req.body.userId;

    const {
      ownerId,
      items,
      totalAmount,
      status = "pending",
      createdAt,
      ownerName,
      shipping,
      payment,
    } = req.body;

    if (!ownerId || !items || !totalAmount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const productIds = items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== items.length) {
      return res
        .status(400)
        .json({ message: "One or more products not found" });
    }

    // Check for sufficient stock before subtracting
    for (const item of items) {
      const product = products.find((p) => p._id.toString() === item.productId);
      if (product.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product: ${product.name}`,
        });
      }
    }

    // Subtract quantities
    await Promise.all(
      items.map(async (item) => {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { quantity: -item.quantity },
        });
      })
    );

    // Process payment info (if provided)
    let processedPayment = null;
    if (payment) {
      // Store only last 4 digits of card number for security
      processedPayment = {
        cardholderName: payment.cardholderName,
        cardLastFour: payment.cardNumber ? payment.cardNumber.slice(-4) : null,
        cardType: payment.cardType,
        paymentMethod: payment.paymentMethod || "credit_card",
        paymentStatus: payment.paymentStatus || "pending"
      };
      
      // Never store CVV/CVC in the database
      // Omitting this data from being saved
    }

    const orderData = {
      ownerId,
      ownerName,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      totalAmount,
      shipping: shipping || {},
      payment: processedPayment,
      status,
      createdAt: createdAt || new Date().toISOString(),
    };

    const newOrder = new Order(orderData);
    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: error.message });
  }
};

export const createUnitItemOrder = async (req, res) => {
  try {
    const { productId } = req.params;
    const ownerName = req.body.ownerName;

    const quantity = 1;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    // Subtract quantity from product stock
    await Product.findByIdAndUpdate(productId, {
      $inc: { quantity: -quantity },
    });

    // Create a new order with the unit item
    const orderData = {
      ownerId: product.ownerId,
      ownerName: ownerName,
      items: [
        {
          productId: productId,
          quantity: quantity,
          unitPrice: product.price,
        },
      ],
      totalAmount: product.price * quantity,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const newOrder = new Order(orderData);
    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating unit item order:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate({
      path: "items.productId",
      select: "name category brand price stock images",
    });

    // Lookup user data for each order based on ownerName
    const ordersWithUserData = await Promise.all(
      orders.map(async (order) => {
        const user = await User.findOne({ name: order.ownerName }).select(
          "email phone role name userType avatar rating"
        );
        return {
          ...order.toObject(),
          userData: user || null,
        };
      })
    );

    res.status(200).json({ orders: ordersWithUserData });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: error.message });
  }
};
