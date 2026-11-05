import Booking from "../../models/BookingModel.js";
import Vehicle from "../../models/vehicleModel.js";
import User from "../../models/userModel.js";
import { errorHandler } from "../../utils/error.js";
import fs from "fs";
import path from "path";
import { documentsUploadDir } from "../../utils/documentMulter.js";

export const allBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.aggregate([
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicleDetails",
        },
      },
      {
        $unwind: {
          path: "$vehicleDetails",
        },
      },
    ]);

    if (!bookings) {
      return next(errorHandler(404, "no bookings found"));
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "error in allBookings"));
  }
};

// change bookings status
export const changeStatus = async (req, res, next) => {
  try {
    if (!req.body) {
      return next(errorHandler(409, "bad request vehicle id and new status needed"));
    }
    const { id, status } = req.body;

    const statusChanged = await Booking.findByIdAndUpdate(id, {
      status: status,
    });

    if (!statusChanged) {
      return next(errorHandler(404, "status not changed or wrong id"));
    }
    res.status(200).json({ message: "status changed" });
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "error in changeStatus"));
  }
};

/**
 * Admin: Get all document verification requests
 * Returns bookings with user and vehicle details
 */
export const getVerificationRequests = async (req, res, next) => {
  try {
    const allBookingsList = await Booking.find();
    const allVehicles = await Vehicle.find();
    const allUsers = await User.find();

    const vehicleMap = new Map(allVehicles.map((v) => [String(v._id), v]));
    const userMap = new Map(allUsers.map((u) => [String(u._id), u]));

    const enriched = allBookingsList
      .filter((b) => b.documentStatus && b.documentStatus !== "not_submitted")
      .map((b) => {
        const vehicle = vehicleMap.get(String(b.vehicleId)) || null;
        const user = userMap.get(String(b.userId)) || null;
        return {
          ...b,
          vehicleDetails: vehicle,
          userDetails: user
            ? {
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
              }
            : null,
        };
      })
      .sort((a, b) => {
        const timeA = new Date(a.submittedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.submittedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });

    res.status(200).json(enriched);
  } catch (error) {
    console.error("Error in getVerificationRequests:", error);
    next(errorHandler(500, "Failed to fetch document verification requests"));
  }
};

/**
 * Admin: Verify (Approve or Reject) customer submitted documents
 */
export const verifyDocuments = async (req, res, next) => {
  try {
    const { bookingId, action, rejectionReason } = req.body;

    if (!bookingId || !action) {
      return next(errorHandler(400, "Booking ID and verification action ('approve' or 'reject') are required"));
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return next(errorHandler(404, "Booking not found"));
    }

    if (action === "approve") {
      const updated = await Booking.findByIdAndUpdate(
        bookingId,
        {
          verificationStatus: "approved",
          adminReviewStatus: "approved",
          status: "booked", // Confirms booking upon administrator approval!
          rejectionReason: "",
          reviewedAt: new Date().toISOString(),
          reviewedBy: req.adminUser ? req.adminUser.username : "admin",
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Customer documents successfully verified and approved. Booking is now confirmed.",
        booking: updated,
      });
    }

    if (action === "reject") {
      if (!rejectionReason || !rejectionReason.trim()) {
        return next(errorHandler(400, "Please provide a valid rejection reason explaining what needs correction."));
      }

      const updated = await Booking.findByIdAndUpdate(
        bookingId,
        {
          verificationStatus: "rejected",
          adminReviewStatus: "rejected",
          documentStatus: "rejected",
          status: "pending_verification",
          rejectionReason: rejectionReason.trim(),
          reviewedAt: new Date().toISOString(),
          reviewedBy: req.adminUser ? req.adminUser.username : "admin",
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Customer documents rejected with reason provided. Customer can submit replacement documents.",
        booking: updated,
      });
    }

    return next(errorHandler(400, "Invalid action. Must be 'approve' or 'reject'."));
  } catch (error) {
    console.error("Error in verifyDocuments:", error);
    next(errorHandler(500, "Failed to update verification status"));
  }
};

/**
 * Admin/System: Delete an uploaded document according to retention policy
 */
export const deleteDocumentFile = async (req, res, next) => {
  try {
    const { bookingId, docType } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return next(errorHandler(404, "Booking not found"));
    }

    const filename = booking[docType];
    if (filename) {
      const filePath = path.join(documentsUploadDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await Booking.findByIdAndUpdate(bookingId, {
        [docType]: null,
      });
    }

    res.status(200).json({ success: true, message: `Document ${docType} deleted successfully` });
  } catch (error) {
    console.error("Error deleting document file:", error);
    next(errorHandler(500, "Failed to delete document file"));
  }
};
