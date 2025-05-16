import axios from "axios";
import Product from "../../models/Products.js";

// Create a new product with QR code generation
export const createProduct = async (req, res) => {
  try {
    const userId = req.userId; // Assuming you have userId in req object
    console.log("Creating product with data:", req.body);

    // Create and save the product first
    const newProduct = new Product({
      ...req.body,
      ownerId: userId, // Set the ownerId to the logged-in user's ID
    });

    const savedProduct = await newProduct.save();
    console.log("Product created successfully:", savedProduct);
    
    // Now that we have the product ID, generate a QR code
    try {
      // Make request to QR code generation service
      const qrResponse = await axios.post("https://api-novatech.vercel.app/qr/generate", {
        endpoint: "https://api-trackit.vercel.app/",
        product_id: savedProduct._id.toString(),
        cloudinary_preset: "neena-bot"
      });
      
      // Extract the secure_url from the QR code response
      const qrCodeUrl = qrResponse.data.secure_url;
      console.log("QR Code generated:", qrCodeUrl);
      
      // Update the product with the QR code URL in the SKU field
      savedProduct.sku = qrCodeUrl;
      await savedProduct.save();
      console.log("Product updated with QR code URL in SKU field");
      
      // Return the updated product
      res.status(201).json(savedProduct);
    } catch (qrError) {
      console.error("Error generating QR code:", qrError.message);
      // Still return product even if QR code generation failed
      res.status(201).json({
        ...savedProduct._doc,
        warning: "Product created but QR code generation failed"
      });
    }
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({
      ownerId: req.userId, // Filter products by the logged-in user's ID
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getProductsByOwnerId = async (req, res) => {
  try {
    const products = await Product.find({
      ownerId: req.params.ownerId, // Filter products by the owner's ID
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate({
      path: "ownerId",
      select: "name email phone", // Adjust fields based on your User schema
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update a product
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const featuredProducts = async (req, res) => {
  try {

   
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
