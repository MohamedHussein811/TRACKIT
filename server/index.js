// index.js
import express, { json } from "express";
import cors from "cors";
import routes from "./routes/routes.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import bodyParser from "body-parser";
import axios from "axios";
axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.BASE_URL;
dotenv.config();

const allowedOrigins = [
  "*",
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

mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });

const server = http.createServer(app);

// Use routes without calling it as a function
app.use("/", routes);

// Start the server with a default port fallback
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
