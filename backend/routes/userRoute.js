// routes/userRoute.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const permitController = require("../controllers/permitController");
const { verifyToken } = require("../utils/token-manager");

// User authentication routes
router.post("/signup", userController.userSignup);
router.post("/login", userController.userLogin);
router.get("/logout", verifyToken, userController.userLogout);
router.get("/verify", verifyToken, userController.verifyUser);

module.exports = router;
