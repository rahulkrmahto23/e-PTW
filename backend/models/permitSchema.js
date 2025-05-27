// models/addPermitSchema.js
const mongoose = require("mongoose");

const permitSchema = new mongoose.Schema(
  {
    permitNumber: {
      type: String,
      required: true,
      unique: true,
    },
    poNumber: {
      type: String,
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    permitType: {
      type: String,
      required: true,
      enum: ["General", "Height", "Confined", "Excavation", "Civil", "Hot"],
    },
    permitStatus: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Approved", "Rejected", "Closed", "Returned"],
    },
    currentLevel: {
      type: Number,
      default: 4,
      enum: [1, 2, 3, 4],
    },
    location: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
    },
    issueDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvalHistory: [
      {
        level: Number,
        approvedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        approvedAt: Date,
        comments: String,
        changes: mongoose.Schema.Types.Mixed,
      },
    ],
    returnedInfo: {
      returnedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      returnedAt: Date,
      comments: String,
      requiredChanges: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Permit", permitSchema);
