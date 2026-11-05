import Booking from "../../models/BookingModel.js";
import { errorHandler } from "../../utils/error.js";
import Razorpay from "razorpay";
import { availableAtDate } from "../../services/checkAvailableVehicle.js";
import Vehicle from "../../models/vehicleModel.js";
import User from "../../models/userModel.js";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { documentsUploadDir } from "../../utils/documentMulter.js";

export const BookCar = async (req, res, next) => {
  try {
    if (!req.body) {
      return next(errorHandler(401, "bad request on body"));
    }

    const {
      user_id,
      vehicle_id,
      totalPrice,
      pickupDate,
      dropoffDate,
      pickup_location,
      dropoff_location,
      pickup_district,
      razorpayPaymentId,
      razorpayOrderId,
    } = req.body;

    const book = new Booking({
      pickupDate,
      dropOffDate: dropoffDate,
      userId: user_id,
      pickUpLocation: pickup_location,
      vehicleId: vehicle_id,
      dropOffLocation: dropoff_location,
      pickUpDistrict: pickup_district,
      totalPrice,
      razorpayPaymentId: razorpayPaymentId || `DEMO_PAY_${Date.now()}`,
      razorpayOrderId: razorpayOrderId || `DEMO_ORD_${Date.now()}`,
      status: "pending_verification",
      documentStatus: "not_submitted",
      verificationStatus: "pending",
      adminReviewStatus: "pending",
      rejectionReason: "",
      submittedAt: null,
      reviewedAt: null,
      drivingLicence: null,
      idProof: null,
    });
    if (!book) {
      console.log("not booked");
      return;
    }

    const booked = await book.save();
    res.status(200).json({
      message: "Booking submitted successfully. Please complete document verification.",
      booked,
    });
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "error while booking car"));
  }
};

//createing razorpay instance
export const razorpayOrder = async (req, res, next) => {
  try {
    const { totalPrice, dropoff_location, pickup_district, pickup_location } =
      req.body;

    console.log(totalPrice)
    if (
      !totalPrice ||
      !dropoff_location ||
      !pickup_district ||
      !pickup_location
    ) {

      return next(errorHandler(400, "Missing Required Feilds Process Cancelled")) ;
    }
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount: totalPrice * 100, // amount in smallest currency unit
      currency: "INR",
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500).send("Some error occured");
    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "error occured in razorpayorder"));
  }
};

// -------------------- -------------------

// getting vehicles without booking for selected Date and location
export const getVehiclesWithoutBooking = async (req, res, next) => {
  try {
    const { pickUpDistrict, pickUpLocation, pickupDate, dropOffDate, model } =
      req.body;

    if (!pickUpDistrict || !pickUpLocation)
      return next(errorHandler(409, "pickup District and location needed"));

    if (!pickupDate || !dropOffDate)
      return next(errorHandler(409, "pickup , dropffdate  is required"));

    // Check if pickupDate is before dropOffDate
    if (pickupDate >= dropOffDate)
      return next(errorHandler(409, "Invalid date range"));

    const vehiclesAvailableAtDate = await availableAtDate(
      pickupDate,
      dropOffDate
    );

    if (!vehiclesAvailableAtDate) {
      return res.status(404).json({
        success: false,
        message: "No vehicles available for the specified time period.",
      });
    }

    const availableVehicles = vehiclesAvailableAtDate.filter(
      (cur) =>
        cur.district === pickUpDistrict &&
        cur.location == pickUpLocation &&
        cur.isDeleted === "false"
    );

    if (!availableVehicles) {
      return res.status(404).json({
        success: false,
        message: "No vehicles available at this location.",
      });
    }

    // If there is no next middleware after this one, send the response
    if (!req.route || !req.route.stack || req.route.stack.length === 1) {
      console.log("hello");
      console.log({ success: "true", data: availableVehicles });
      return res.status(200).json({
        success: true,
        data: availableVehicles,
      });
    }

    // If there is a next middleware, pass control to it
    res.locals.actionResult = [availableVehicles, model];
    next();
  } catch (error) {
    console.log(error);
    return next(
      errorHandler(500, "An error occurred while fetching available vehicles.")
    );
  }
};

//getting all variants of a model which are not booked
export const showAllVariants = async (req, res, next) => {
  try {
    const actionResult = res.locals.actionResult;
    const model = actionResult[1];

    if (!actionResult[0]) {
      next(errorHandler(404, "no actionResult"));
    }
    const allVariants = actionResult[0].filter((cur) => {
      return cur.model === model;
    });

    res.status(200).json(allVariants);
  } catch (error) {
    next(errorHandler(500, "internal error in showAllVariants"));
  }
};

//show i if more vehcles with same model available
export const showOneofkind = async (req, res, next) => {
  try {
    const actionResult = res.locals.actionResult;

    const modelsMap = {};
    const singleVehicleofModel = [];

    if (!actionResult) {
      next(errorHandler(404, "no actionResult"));
      return;
    }

    actionResult[0].forEach((cur) => {
      if (!modelsMap[cur.model]) {
        modelsMap[cur.model] = true;
        singleVehicleofModel.push(cur);
      }
    });

    if (!singleVehicleofModel) {
      next(errorHandler(404, "no vehicles available"));
      return;
    }

    res.status(200).json(singleVehicleofModel);
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "error in showOneofkind"));
  }
};

//  filtering vehicles
export const filterVehicles = async (req, res, next) => {
  try {
    if (!req.body) {
      next(errorHandler(401, "bad request no body"));
      return;
    }
    const transformedData = req.body;
    if (!transformedData) {
      next(errorHandler(401, "select filter option first"));
    }
    const generateMatchStage = (data) => {
      const carTypes = [];
      data.forEach((cur) => {
        if (cur.type === "car_type") {
          // Extract the first key of the object and push it into 'cartypes' array
          const firstKey = Object.keys(cur).find((key) => key !== "type");
          if (firstKey) {
            carTypes.push(firstKey);
          }
        }
      });

      const transmitions = [];
      data.forEach((cur) => {
        // If the current element has type equal to 'transmition'
        if (cur.type === "transmition") {
          // Iterate through each key of the current element
          Object.keys(cur).forEach((key) => {
            // Exclude the 'type' key and push only keys with truthy values into 'transmitions' array
            if (key !== "type" && cur[key]) {
              transmitions.push(key);
            }
          });
        }
      });

      return {
        $match: {
          $and: [
            carTypes.length > 0 ? { car_type: { $in: carTypes } } : null,
            transmitions.length > 0
              ? { transmition: { $in: transmitions } }
              : null,
          ].filter((condition) => condition !== null), // Remove null conditions
        },
      };
    };

    const matchStage = generateMatchStage(transformedData);

    const filteredVehicles = await Vehicle.aggregate([matchStage]);
    if (!filteredVehicles) {
      next(errorHandler(401, "no vehicles found"));
      return;
    }
    res.status(200).json({
      status: "success",
      data: {
        filteredVehicles,
      },
    });
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "internal server error in fiilterVehicles"));
  }
};

export const findBookingsOfUser = async (req, res, next) => {
  try {
    if (!req.body) {
      next(errorHandler(409, "_id of user is required"));
      return;
    }
    const { userId } = req.body;
    const convertedUserId = userId;

    const bookings = await Booking.aggregate([
      {
        $match: {
          userId: convertedUserId,
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "result",
        },
      },
      {
        $project: {
          _id: 0,
          bookingDetails: "$$ROOT",
          vehicleDetails: {
            $arrayElemAt: ["$result", 0],
          },
        },
      },
    ]);

    res.status(200).json(bookings);
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "internal error in findBookingOfUser"));
  }
};

//api to ge the latestbookings details
export const latestbookings = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    console.log(user_id);
    const convertedUserId = user_id;

    const bookings = await Booking.aggregate([
      {
        $match: {
          userId: convertedUserId,
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "result",
        },
      },
      {
        $project: {
          _id: 0,
          bookingDetails: "$$ROOT",
          vehicleDetails: {
            $arrayElemAt: ["$result", 0],
          },
        },
      },
      {
        $sort:
          /**
           * Provide any number of field/order pairs.
           */
          {
            "bookingDetails.createdAt": -1,
          },
      },
      {
        $limit:
          /**
           * Provide the number of documents to limit.
           */
          1,
      },
    ]);

    if (!bookings) {
      res.status(404, "error no such booking");
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "internal server error in latestbookings"));
  }
};

//send booking details to user email
export const sendBookingDetailsEamil = (req, res, next) => {
  try {
    console.log("hello");
    const { toEmail, data } = req.body;
    console.log("hi");
    console.log(req.body);

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_HOST,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const generateEmailHtml = (bookingDetails, vehicleDetails) => {
      const pickupDate = new Date(bookingDetails.pickupDate);
      const dropOffDate = new Date(bookingDetails.dropOffDate);

      return `
          <div style="font-family: Arial, sans-serif; padding: 10px;">
              <h2>Booking Details</h2>
              <hr>
              <p><strong>Booking Id:</strong> ${bookingDetails._id}</p>
              <p><strong>Total Amount:</strong> ${bookingDetails.totalPrice}</p>
              <p><strong>Pickup Location:</strong> ${
                bookingDetails.pickUpLocation
              }</p>
              <p><strong>Pickup Date:</strong> ${pickupDate.getDate()}/${
        pickupDate.getMonth() + 1
      }/${pickupDate.getFullYear()} ${pickupDate.getHours()}:${pickupDate.getMinutes()}</p>
              <p><strong>Dropoff Location:</strong> ${
                bookingDetails.dropOffLocation
              }</p>
              <p><strong>Dropoff Date:</strong> ${dropOffDate.getDate()}/${
        dropOffDate.getMonth() + 1
      }/${dropOffDate.getFullYear()} ${dropOffDate.getHours()}:${dropOffDate.getMinutes()}</p>
              <h2>Vehicle Details</h2>
              <hr>
              <p><strong>Vehicle Number:</strong> ${
                vehicleDetails.registeration_number
              }</p>
              <p><strong>Model:</strong> ${vehicleDetails.model}</p>
              <p><strong>Company:</strong> ${vehicleDetails.company}</p>
              <p><strong>Vehicle Type:</strong> ${vehicleDetails.car_type}</p>
              <p><strong>Seats:</strong> ${vehicleDetails.seats}</p>
              <p><strong>Fuel Type:</strong> ${vehicleDetails.fuel_type}</p>
              <p><strong>Transmission:</strong> ${
                vehicleDetails.transmition
              }</p>
              <p><strong>Manufacturing Year:</strong> ${
                vehicleDetails.year_made
              }</p>
          </div>
      `;
    };

    var mailOptions = {
      from: process.env.EMAIL_HOST,
      to: toEmail,
      subject: "rentaride.shop booking details",
      html: generateEmailHtml(data[0].bookingDetails, data[0].vehicleDetails),
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
        res.status(200).json("Email sent successfully");
      }
    });
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "internal server error in sendBookingDetailsEmail"));
  }
};

/**
 * Customer Document Upload Controller
 * Handles driving licence and dummy ID uploads with validation
 */
export const uploadBookingDocuments = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return next(errorHandler(404, "Booking not found"));
    }

    const files = req.files || {};
    const licenceFile = files.drivingLicence ? files.drivingLicence[0] : null;
    const idProofFile = files.idProof ? files.idProof[0] : null;

    if (!licenceFile && !idProofFile && !booking.drivingLicence && !booking.idProof) {
      return next(errorHandler(400, "Please upload both Driving Licence and Identity Proof documents."));
    }

    // Clean up replaced files from disk if new file uploaded
    if (licenceFile && booking.drivingLicence) {
      const oldPath = path.join(documentsUploadDir, booking.drivingLicence);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (e) { /* ignore deletion err */ }
      }
    }
    if (idProofFile && booking.idProof) {
      const oldPath = path.join(documentsUploadDir, booking.idProof);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (e) { /* ignore deletion err */ }
      }
    }

    const updatedDrivingLicence = licenceFile ? licenceFile.filename : booking.drivingLicence;
    const updatedIdProof = idProofFile ? idProofFile.filename : booking.idProof;

    const isResubmission = booking.verificationStatus === "rejected";

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        drivingLicence: updatedDrivingLicence,
        idProof: updatedIdProof,
        documentStatus: isResubmission ? "resubmitted" : "submitted",
        verificationStatus: "pending",
        adminReviewStatus: "pending",
        rejectionReason: "",
        submittedAt: new Date().toISOString(),
        status: "pending_verification",
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Documents submitted successfully for verification.",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error in uploadBookingDocuments:", error);
    next(errorHandler(500, "Failed to upload verification documents"));
  }
};

/**
 * Customer/Admin: Fetch details of a single booking along with vehicle
 */
export const getBookingDetails = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return next(errorHandler(404, "Booking not found"));
    }

    const vehicle = await Vehicle.findById(booking.vehicleId);
    res.status(200).json({
      bookingDetails: booking,
      vehicleDetails: vehicle,
    });
  } catch (error) {
    console.error("Error in getBookingDetails:", error);
    next(errorHandler(500, "Failed to fetch booking details"));
  }
};

/**
 * Secure Document Serving Controller
 * Restricts document viewing to the relevant customer and authorized administrators
 */
export const serveDocument = async (req, res, next) => {
  try {
    const { bookingId, docType } = req.params;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return next(errorHandler(404, "Booking not found"));
    }

    const userId = typeof req.user === "object" ? req.user.id || req.user._id : req.user;
    const user = await User.findById(userId);

    const isOwner = String(booking.userId) === String(userId);
    const isAdmin = Boolean(user && user.isAdmin);

    if (!isOwner && !isAdmin) {
      return next(errorHandler(403, "Access denied. You do not have permission to view this document."));
    }

    const filename = booking[docType];
    if (!filename) {
      return next(errorHandler(404, "Requested document has not been uploaded."));
    }

    const filePath = path.join(documentsUploadDir, filename);
    if (!fs.existsSync(filePath)) {
      return next(errorHandler(404, "Document file not found on server."));
    }

    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".pdf": "application/pdf",
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error serving document:", error);
    next(errorHandler(500, "Failed to retrieve document"));
  }
};

