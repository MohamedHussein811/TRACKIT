import { Schema, model } from "mongoose";

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  sku: {
    type: String,
    default: "",

  },
  image: {
    type: String,
    required: true,
    default: "https://via.placeholder.com/150",
  },

  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  minStockLevel: {
    type: Number,
    default: 0,
  },
  supplierId: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
}, { timestamps: true });

const Product = model("Product", productSchema);
export default Product;
