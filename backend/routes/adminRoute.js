import express from "express";
import {
  adminAuth,
  adminProfiile,
  getAllUsers,
  getAllVendors,
  deleteUser,
} from "../controllers/adminControllers/adminController.js";
import { signIn } from "../controllers/authController.js";
import { signOut } from "../controllers/userControllers/userController.js";
import { addProduct, deleteVehicle, editVehicle, showVehicles } from "../controllers/adminControllers/dashboardController.js";
import { multerUploads } from "../utils/multer.js";
import { insertDummyData, getCarModelData } from "../controllers/adminControllers/masterCollectionController.js";
import { approveVendorVehicleRequest, fetchVendorVehilceRequests, rejectVendorVehicleRequest } from "../controllers/adminControllers/vendorVehilceRequests.js";
import { allBookings, changeStatus, getVerificationRequests, verifyDocuments, deleteDocumentFile } from "../controllers/adminControllers/bookingsController.js";
import { verifyAdmin } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/dashboard", signIn, adminAuth);
router.post("/profile", adminProfiile);
router.get("/signout", signOut);
router.post("/addProduct", multerUploads, addProduct);
router.get("/showVehicles", showVehicles);
router.delete("/deleteVehicle/:id", deleteVehicle);
router.put("/editVehicle/:id", editVehicle);
router.get("/dummyData", insertDummyData);
router.get("/getVehicleModels", getCarModelData);
router.get("/fetchVendorVehilceRequests", fetchVendorVehilceRequests);
router.post("/approveVendorVehicleRequest", approveVendorVehicleRequest);
router.post("/rejectVendorVehicleRequest", rejectVendorVehicleRequest);
router.get("/allBookings", allBookings);
router.post("/changeStatus", changeStatus);

// Customer & Vendor management routes
router.get("/allUsers", getAllUsers);
router.get("/allVendors", getAllVendors);
router.delete("/deleteUser/:id", deleteUser);

// Role-based admin document verification routes
router.get("/documentVerificationRequests", verifyAdmin, getVerificationRequests);
router.post("/verifyDocuments", verifyAdmin, verifyDocuments);
router.delete("/document/:bookingId/:docType", verifyAdmin, deleteDocumentFile);

export default router;
