const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

// Use the local MongoDB connection string
const mongoURL = process.env.MONGO_URL_LOCAL;
//const mongoURL = process.env.MONGO_URL_ATLAS;

if (!mongoURL) {
  console.error("MongoDB LOCAL URL connection is missing.");
  process.exit(1);
}

mongoose.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to Atlas MongoDB"))
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

const db = mongoose.connection;

db.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

module.exports = db;
