import { Schema, model, mongoose } from "mongoose";

const UserSchema = new Schema({
  password: { type: String },
  googleId: { type: String, default:"" }, // Store Google ID for users logging in via Google
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin", "moderator"],
  },
  name: {
    type: String,
    required: true,
    default: "",
  },

  businessName: {type: String, default: ""},
  //userType: 'business' | 'supplier' | 'distributor' | 'organizer';
  userType: {
    type: String,
    enum: ["business", "supplier", "distributor", "organizer"],
    default: "business",
  },
  avatar: { type: String, default: "" },

  isActivated: { type: Boolean, default: false },

  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  productsCount: { type: Number, default: 0 },
  ordersCount: { type: Number, default: 0 },
  eventsCount: { type: Number, default: 0 },

  cart: {
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true },
        size: { type: String, default: "" },
        color: { type: String, default: "" },
      },
    ],
  },

  wishlist: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    },
  ],

  hidden: { type: Boolean, default: false },

  resetPasswordToken: { type: String, default: "" },

  activation_code: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const User = model("users", UserSchema);
export default User;
