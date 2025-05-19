import axios from "axios";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { json } from "express";
import mongoose from "mongoose";
import routes from "./routes/routes.js";
axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.BASE_URL;
dotenv.config({ path: './dev.env' });

const allowedOrigins = [
  process.env.CLIENT_URL,
];
const app = express();

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["POST", "GET", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use(json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const uri = process.env.MONGODB_URI;

function setupMongooseEvents() {
  mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`Mongoose connection error: ${err}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from DB');
    setTimeout(() => {
      mongoose.connect(uri)
        .catch(err => console.error('Reconnection failed:', err));
    }, 5000);
  });
}

// Connect to database once when the module is loaded
setupMongooseEvents();
mongoose.connect(uri)
  .then(() => console.log("Connected to MongoDB"))
  .catch(error => console.error("Initial connection error:", error.message));

app.use("/", routes);

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// This is what Vercel needs
export default app;
