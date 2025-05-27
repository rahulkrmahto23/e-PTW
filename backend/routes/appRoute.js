const express = require("express");
const router = express.Router();
const userRoute = require("./userRoute");
const permitRoute = require("./permitRoute");

router.use("/user", userRoute);  // Make sure this is router.use() not appRouter if you're using Express Router
router.use("/permits",permitRoute);
module.exports = router;