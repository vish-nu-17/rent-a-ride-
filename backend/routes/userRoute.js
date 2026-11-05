import express from "express";

import { verifyToken } from "../utils/verifyUser.js";
import { updateUser, deleteUser, signOut } from "../controllers/userControllers/userController.js";
import { checkAvailability, listAllVehicles, searchCar, showVehicleDetails } from "../controllers/userControllers/userAllVehiclesController.js";
import { editUserProfile, uploadProfilePicture } from "../controllers/userControllers/userProfileController.js";
import { multerUploads } from "../utils/multer.js";
import {
  BookCar,
  razorpayOrder,
  getVehiclesWithoutBooking,
  filterVehicles,
  showOneofkind,
  showAllVariants,
  findBookingsOfUser,
  sendBookingDetailsEamil,
  latestbookings,
  uploadBookingDocuments,
  getBookingDetails,
  serveDocument,
} from "../controllers/userControllers/userBookingController.js";
import { documentUpload } from "../utils/documentMulter.js";

const router = express.Router();

router.post("/update/:id", updateUser);
router.delete("/delete/:id", deleteUser);
router.get("/signout", signOut);
router.get("/listAllVehicles", listAllVehicles);
router.post("/showVehicleDetails", showVehicleDetails);
router.post("/editUserProfile/:id", editUserProfile);
router.post("/uploadProfilePicture/:id", multerUploads, uploadProfilePicture);
router.post("/razorpay", verifyToken, razorpayOrder);
router.post("/bookCar", BookCar);
router.post("/filterVehicles", filterVehicles);
router.post("/getVehiclesWithoutBooking", getVehiclesWithoutBooking, showAllVariants);
router.post("/showSingleofSameModel", getVehiclesWithoutBooking, showOneofkind);
router.post("/findBookingsOfUser", findBookingsOfUser);
router.post("/latestbookings", latestbookings);
router.post("/sendBookingDetailsEamil", sendBookingDetailsEamil);

// Customer Document Submission & Verification Routes
router.post(
  "/uploadBookingDocuments/:bookingId",
  documentUpload.fields([
    { name: "drivingLicence", maxCount: 1 },
    { name: "idProof", maxCount: 1 },
  ]),
  uploadBookingDocuments
);
router.get("/bookingDetails/:bookingId", getBookingDetails);
router.get("/document/:bookingId/:docType", verifyToken, serveDocument);

export default router;
