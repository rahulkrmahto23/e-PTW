const Permit = require("../models/permitSchema");
const User = require("../models/userSchema");

exports.createPermit = async (req, res) => {
  try {
    const userId = res.locals.jwtData.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Only level 4 users can create permits
    if (user.level !== 4) {
      return res.status(403).json({
        success: false,
        message: "Only Level 4 users can create permits",
      });
    }

    const {
      permitNumber,
      poNumber,
      employeeName,
      permitType,
      location,
      remarks,
      issueDate,
      expiryDate,
    } = req.body;

    const permit = new Permit({
      permitNumber,
      poNumber,
      employeeName,
      permitType,
      permitStatus: "Pending",
      currentLevel: 4,
      location,
      remarks,
      issueDate,
      expiryDate,
      createdBy: userId,
    });

    await permit.save();

    return res.status(201).json({
      success: true,
      message: "Permit created successfully",
      permit,
    });
  } catch (error) {
    console.error("Permit Creation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating permit",
      error: error.message,
    });
  }
};

exports.getAllPermits = async (req, res) => {
  try {
    const userId = res.locals.jwtData.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let query = {};

    // Non-admin users can only see permits at their level or below
    if (user.role !== "ADMIN") {
      query = {
        $or: [
          { currentLevel: user.level },
          { "approvalHistory.approvedBy": userId },
          { createdBy: userId },
        ],
      };
    }

    const permits = await Permit.find(query)
      .populate("createdBy", "name email level")
      .populate("approvalHistory.approvedBy", "name email level")
      .populate("returnedInfo.returnedBy", "name email level");

    return res.status(200).json({
      success: true,
      message: "Permits fetched successfully",
      permits,
    });
  } catch (error) {
    console.error("Error fetching permits:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching permits",
      error: error.message,
    });
  }
};

exports.approvePermit = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Find the permit
    const permit = await Permit.findById(id).populate("createdBy", "level");

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: "Permit not found",
      });
    }

    // Check if the user has the right level to approve
    if (user.level !== permit.currentLevel) {
      return res.status(403).json({
        success: false,
        message: `Only Level ${permit.currentLevel} users can approve this permit`,
      });
    }

    // Add approval to history
    permit.approvalHistory.push({
      level: user.level,
      approvedBy: user._id,
      approvedAt: new Date(),
    });

    // Move to next level or mark as approved
    if (permit.currentLevel > 1) {
      permit.currentLevel -= 1;
      permit.permitStatus = "Pending";
    } else {
      permit.permitStatus = "Approved";
    }

    await permit.save();

    // Get the approved user details
    const approvedByUser = await User.findById(user._id).select(
      "name email level"
    );

    return res.status(200).json({
      success: true,
      message: "Permit approved and forwarded",
      approvedBy: approvedByUser,
      currentLevel: permit.currentLevel,
      permitStatus: permit.permitStatus,
    });
  } catch (error) {
    console.error("🚨 Error approving permit:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while approving permit",
      error: error.message,
    });
  }
};

exports.returnPermit = async (req, res) => {
  try {
    const userId = res.locals.jwtData.id;
    const { id } = req.params;
    const { requiredChanges } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const permit = await Permit.findById(id);
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: "Permit not found",
      });
    }

    if (user.level !== permit.currentLevel) {
      return res.status(403).json({
        success: false,
        message: `You must be a Level ${permit.currentLevel} user to return this permit`,
      });
    }

    permit.returnedInfo = {
      returnedBy: userId,
      returnedAt: new Date(),
      requiredChanges,
    };

    if (permit.currentLevel < 4) {
      permit.currentLevel += 1;
    }
    permit.permitStatus = "Returned";

    await permit.save();

    return res.status(200).json({
      success: true,
      message: "Permit returned for corrections",
      permit,
    });
  } catch (error) {
    console.error("Error returning permit:", error);
    return res.status(500).json({
      success: false,
      message: "Error returning permit",
      error: error.message,
    });
  }
};

exports.editPermitDetails = async (req, res) => {
  try {
    const userId = res.locals.jwtData?.id;
    const { id } = req.params;
    const updates = req.body;

    if (!updates || typeof updates !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing request body",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const permit = await Permit.findById(id);
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: "Permit not found",
      });
    }

    if (permit.permitStatus !== "Pending") {
      return res.status(403).json({
        success: false,
        message: "You can only edit permits in Pending status",
      });
    }

    if (user.level !== permit.currentLevel + 1) {
      return res.status(403).json({
        success: false,
        message: `Only Level ${
          permit.currentLevel + 1
        } users can edit this permit (currently pending at Level ${
          permit.currentLevel
        })`,
      });
    }

    const allowedUpdates = {
      permitNumber: updates.permitNumber,
      poNumber: updates.poNumber,
      employeeName: updates.employeeName,
      permitType: updates.permitType,
      location: updates.location,
      remarks: updates.remarks,
      issueDate: updates.issueDate,
      expiryDate: updates.expiryDate,
    };

    Object.keys(allowedUpdates).forEach((key) => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key];
      }
    });

    Object.assign(permit, allowedUpdates);

    permit.approvalHistory.push({
      level: user.level,
      approvedBy: userId,
      approvedAt: new Date(),
      changes: allowedUpdates,
      comments: "Permit details updated by upper-level user",
    });

    await permit.save();

    return res.status(200).json({
      success: true,
      message: "Permit details updated successfully",
      permit,
    });
  } catch (error) {
    console.error("Error editing permit details:", error);
    return res.status(500).json({
      success: false,
      message: "Error editing permit details",
      error: error.message,
    });
  }
};

exports.searchPermits = async (req, res) => {
  try {
    const userId = res.locals.jwtData.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const searchFields = req.query;
    let query = {};

    // Build dynamic query based on available fields
    for (const key in searchFields) {
      if (searchFields[key]) {
        if (["issueDate", "expiryDate"].includes(key)) {
          // Convert string to Date for date fields
          query[key] = new Date(searchFields[key]);
        } else if (
          key === "permitNumber" ||
          key === "poNumber" ||
          key === "employeeName" ||
          key === "location" ||
          key === "remarks"
        ) {
          // Partial matching with regex for string fields
          query[key] = { $regex: searchFields[key], $options: "i" };
        } else {
          query[key] = searchFields[key];
        }
      }
    }

    // Restrict view for non-admin users
    if (user.role !== "ADMIN") {
      query.$or = [
        { currentLevel: user.level },
        { "approvalHistory.approvedBy": userId },
        { createdBy: userId },
      ];
    }

    const permits = await Permit.find(query)
      .populate("createdBy", "name email level")
      .populate("approvalHistory.approvedBy", "name email level")
      .populate("returnedInfo.returnedBy", "name email level");

    return res.status(200).json({
      success: true,
      message: "Permit search successful",
      count: permits.length,
      permits: permits.map((permit) => ({
        _id: permit._id,
        permitNumber: permit.permitNumber,
        poNumber: permit.poNumber,
        employeeName: permit.employeeName,
        permitType: permit.permitType,
        permitStatus: permit.permitStatus,
        currentLevel: permit.currentLevel,
        location: permit.location,
        remarks: permit.remarks,
        issueDate: permit.issueDate,
        expiryDate: permit.expiryDate,
        createdBy: permit.createdBy,
        approvalHistory: permit.approvalHistory,
        returnedInfo: permit.returnedInfo,
        createdAt: permit.createdAt,
        updatedAt: permit.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Permit search error:", error);
    return res.status(500).json({
      success: false,
      message: "Error while searching permits",
      error: error.message,
    });
  }
};

exports.deletePermit = async (req, res) => {
  try {
    const userId = res.locals.jwtData.id;
    const { id } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const permit = await Permit.findById(id);
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: "Permit not found",
      });
    }

    // Only the creator or an ADMIN can delete the permit
    if (permit.createdBy.toString() !== userId && user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this permit",
      });
    }

    // Only allow deleting if status is not Approved
    if (permit.permitStatus === "Approved") {
      return res.status(403).json({
        success: false,
        message: "Approved permits cannot be deleted",
      });
    }

    await permit.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Permit deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting permit:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting permit",
      error: error.message,
    });
  }
};

exports.getPermitById = async (req, res) => {
  try {
    const userId = res.locals.jwtData.id;
    const { id } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const permit = await Permit.findById(id)
      .populate("createdBy", "name email level")
      .populate("approvalHistory.approvedBy", "name email level")
      .populate("returnedInfo.returnedBy", "name email level");

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: "Permit not found",
      });
    }

    // Check if user has permission to view this permit
    if (
      user.role !== "ADMIN" &&
      permit.createdBy._id.toString() !== userId &&
      !permit.approvalHistory.some(
        (approval) => approval.approvedBy._id.toString() === userId
      ) &&
      permit.currentLevel !== user.level
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this permit",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Permit fetched successfully",
      permit,
    });
  } catch (error) {
    console.error("Error fetching permit:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching permit",
      error: error.message,
    });
  }
};

// Get pending permits for the logged-in user's level
exports.getPendingPermits = async (req, res) => {
  try {
    const userId = res.locals.jwtData.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const pendingPermits = await Permit.find({
      currentLevel: user.level,
      permitStatus: "Pending",
    })
      .populate("createdBy", "name email level")
      .populate("approvalHistory.approvedBy", "name email level")
      .populate("returnedInfo.returnedBy", "name email level");

    return res.status(200).json({
      success: true,
      message: "Pending permits fetched successfully",
      count: pendingPermits.length,
      permits: pendingPermits,
    });
  } catch (error) {
    console.error("Error fetching pending permits:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching pending permits",
      error: error.message,
    });
  }
};
