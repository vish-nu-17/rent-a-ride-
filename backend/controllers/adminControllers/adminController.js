import User from "../../models/userModel.js";
import Booking from "../../models/BookingModel.js";
import Vehicle from "../../models/vehicleModel.js";
import { errorHandler } from "../../utils/error.js";

export const adminAuth = async (req, res, next) => {
  try {
    if (req.user && req.user.isAdmin) {
      res.status(200).json({ message: "admin logged in successfully" });
    } else {
      res.status(403).json({ message: "only access for admins" });
    }
  } catch (error) {
    next(error);
  }
};

export const adminProfiile = async (req, res, next) => {
  try {
    const adminUser = req.adminUser || req.user;
    if (!adminUser) {
      return next(errorHandler(401, "Not authenticated"));
    }
    const user = await User.findById(adminUser._id || adminUser.id);
    if (!user) {
      return next(errorHandler(404, "Admin profile not found"));
    }
    const { password, ...rest } = user._doc || user;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// Admin: Get all customers
export const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await User.find();
    const allBookings = await Booking.find();

    // Map bookings count by userId
    const bookingCountMap = {};
    allBookings.forEach((b) => {
      const uid = String(b.userId);
      bookingCountMap[uid] = (bookingCountMap[uid] || 0) + 1;
    });

    // Customers: users who are not admin and not vendor
    const customers = allUsers
      .filter((u) => !u.isAdmin && !u.isVendor)
      .map((u) => {
        const { password, refreshToken, ...rest } = u._doc || u;
        return {
          ...rest,
          totalBookings: bookingCountMap[String(u._id)] || 0,
        };
      });

    res.status(200).json(customers);
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    next(errorHandler(500, "Failed to fetch customers"));
  }
};

// Admin: Get all vendors
export const getAllVendors = async (req, res, next) => {
  try {
    const allUsers = await User.find();
    const allVehicles = await Vehicle.find();

    // Map vehicles count by vendor_id
    const vehicleCountMap = {};
    allVehicles.forEach((v) => {
      if (v.vendor_id) {
        const vid = String(v.vendor_id);
        vehicleCountMap[vid] = (vehicleCountMap[vid] || 0) + 1;
      }
    });

    const vendors = allUsers
      .filter((u) => u.isVendor === true || u.isVendor === "true")
      .map((u) => {
        const { password, refreshToken, ...rest } = u._doc || u;
        return {
          ...rest,
          totalVehicles: vehicleCountMap[String(u._id)] || 0,
        };
      });

    res.status(200).json(vendors);
  } catch (error) {
    console.error("Error in getAllVendors:", error);
    next(errorHandler(500, "Failed to fetch vendors"));
  }
};

// Admin: Delete a user or vendor
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(errorHandler(400, "User ID required"));
    }
    const deleted = await User.findByIdAndDelete
      ? await User.findByIdAndDelete(id)
      : await User.findByIdAndUpdate(id, { isDeleted: true });

    if (!deleted) {
      return next(errorHandler(404, "User not found"));
    }
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    next(errorHandler(500, "Failed to delete user"));
  }
};

