const express = require("express");
const router = express.Router();
const permitController = require("../controllers/permitController");
const { verifyToken } = require("../utils/token-manager");

// Permit management routes
router.post("/", verifyToken, permitController.createPermit);
router.get("/", verifyToken, permitController.getAllPermits);
router.get("/approve/:id", verifyToken, permitController.approvePermit);
router.put("/return/:id", verifyToken, permitController.returnPermit);
router.put("/edit/:id", verifyToken, permitController.editPermitDetails);
router.get("/search", verifyToken, permitController.searchPermits);
router.delete("/delete/:id", verifyToken, permitController.deletePermit);

// New routes
router.get("/:id", verifyToken, permitController.getPermitById);
router.get("/pending/user", verifyToken, permitController.getPendingPermits);

module.exports = router;