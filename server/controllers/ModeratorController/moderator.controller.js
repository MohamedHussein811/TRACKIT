import Event from "../../models/Events.js";
import Order from "../../models/Orders.js";
import Product from '../../models/Products.js';
import Reservation from "../../models/Reservation.js";
import User from "../../models/Users.js";
import axios from "axios";
export const allOrders = async (req, res) => {
  try {
    // Fetch all orders from the database, optionally you can sort or paginate
    const orders = await Order.find().populate('ownerId').populate('items.productId').exec();

    // If no orders are found
    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    // Send the orders as the response
    console.log("Fetched orders:", orders);
    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: error.message });
  }
};

export const editProduct = async (req, res) => {
  try {
    const { productId, name, description, price, quantity, minStockLevel } = req.body;


    // edit only the fields that are provided in the request body
    const updateData = {
      ...(name && { name }),
      ...(description && { description }),
      ...(price && { price }),
      ...(quantity && { quantity }),
      ...(minStockLevel && { minStockLevel }),
    };

    // Find the product by ID and update it
    const product = await Product.findByIdAndUpdate(productId, updateData, { new: true });

    if (!product) {
      console.log("Product not found:", productId);
      return res.status(404).json({ message: "Product not found" });
    }

    // Send the updated product as the response
    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: error.message });
  }
};

export const changeOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    // Validate input
    if (!orderId || !status) {
      return res.status(400).json({ message: "Order ID and status are required" });
    }

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      console.log("Order not found:", orderId);
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the order status
    order.status = status;

    // Process based on order status
    for (const item of order.items) {
      const product = await Product.findById(item.productId);

      if (product) {
        if (status === 'delivered') {
          // Find the customer (owner of the order)
          const customer = await User.findOne({ name: order.ownerName });
          
          if (customer) {
            // Create a copy of the product for the customer with a temporary random SKU
            const tempSku = Math.random().toString(36).substring(2, 18); // Generate random 16-character string
            
            const newProduct = new Product({
              name: product.name,
              sku: tempSku,
              image: product.image,
              description: product.description,
              category: product.category,
              price: product.price,
              quantity: item.quantity, // Set quantity to what they ordered
              minStockLevel: product.minStockLevel,
              ownerId: customer._id // Set the customer as the owner
            });
            
            // Save the new product to get the ID
            const savedProduct = await newProduct.save();
            
            // Generate QR code using the product ID
            try {
              const qrResponse = await axios.post("https://api-novatech.vercel.app/qr/generate", {
                endpoint: "https://api-trackit.vercel.app/",
                product_id: savedProduct._id.toString(),
                cloudinary_preset: "neena-bot"
              });
              
              // Update the product with the QR code URL
              if (qrResponse.data && qrResponse.data.secure_url) {
                savedProduct.sku = qrResponse.data.secure_url;
                await savedProduct.save();
              }
            } catch (qrError) {
              console.error("Error generating QR code:", qrError);
              // Product is still saved with the random SKU if QR generation fails
            }
            
            // Increment the productsCount for the customer
            customer.productsCount = (customer.productsCount || 0) + 1;
            await customer.save();
          }
        } else if (status === 'cancelled') {
          // Increase the product quantity if order is cancelled
          product.quantity += item.quantity;
          await product.save();
        }
      }
    }

    // Save the updated order
    await order.save();
    res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: error.message });
  }
};



export const getDashboardStats = async (req, res) => {
  try {

    const userId = req.userId; // Assuming you have user ID from the request

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userName = user.name; // Assuming the user has a name field


    // Get total products
    const totalProducts = await Product.countDocuments({ ownerId: userId });

    // Get low stock items
    const lowStockItemsData = await Product.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $lt: ['$quantity', '$minStockLevel'] },
              { $gt: ['$quantity', 0] }
            ]
          }
        }
      },
      { $count: 'count' }
    ]);
    
    const lowStockItems = lowStockItemsData.length ? lowStockItemsData[0].count : 0;
    
    // Get pending orders
    const pendingOrders = await Order.countDocuments({ status: 'pending', userName  });

    // Get upcoming events length (assuming you have an events collection)
    const upcomingEvents = await Event.countDocuments();
    const myreservedEvents = await Reservation.countDocuments({attendeeName: userName});
     

    // Get recent sales (example: calculate total sales in the last 30 days)
    const recentSalesData = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) } } },
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } }
    ]);

    const recentSales = {
      amount: recentSalesData.length ? recentSalesData[0].totalSales : 0,
      change: 8.5, // Placeholder for change, you can calculate the change in sales over a period
    };

    // Get top products by sales (most sold products in the last 30 days)
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.productId', totalQuantity: { $sum: '$items.quantity' } } },
      { $sort: { totalQuantity: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          name: '$productInfo.name',
          quantity: '$totalQuantity',
        }
      }
    ]);

    // Prepare the final stats object
    const dashboardStats = {
      totalProducts,
      lowStockItems,
      pendingOrders,
      upcomingEvents,
      myreservedEvents,
      recentSales,
      topProducts,
    };

    // Send the response
    res.status(200).json(dashboardStats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
};

