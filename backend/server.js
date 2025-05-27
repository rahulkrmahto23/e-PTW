const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const db = require("./db/db");
const appRoute = require("./routes/appRoute");

const app = express();
dotenv.config();
const PORT = process.env.PORT || 7000;

const allowedOrigins = [
  "https://e-jvd5fee8u-rahul-kumar-mahtos-projects.vercel.app",
  "https://e-ptw-nine.vercel.app",
  "http://localhost:5000", // for local dev
];
// CORS configuration
const corsOptions = {
 origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Required for cookies/session
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions)); // Enable CORS with options
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET)); // Fixed typo in COOKIE_SECRET
app.use(morgan("dev"));
app.use("/api/v1", appRoute);

// Root route
app.get("/", (req, res) => {
  res.send("hello");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});