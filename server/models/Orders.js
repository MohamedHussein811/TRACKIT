import { Schema, model } from "mongoose";

const orderItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

// Shipping information schema
const shippingInfoSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

// Payment information schema
const paymentInfoSchema = new Schema(
  {
    cardholderName: {
      type: String,
      trim: true,
    },
    // Store only last 4 digits for reference
    cardLastFour: {
      type: String,
      trim: true,
      maxlength: 4,
    },
    cardType: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: "credit_card",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true
    },
    ownerName: {
      type: String,
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    shipping: shippingInfoSchema,
    payment: paymentInfoSchema,
    status: {
      type: String,
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Order = model("Order", orderSchema);

export default Order;
