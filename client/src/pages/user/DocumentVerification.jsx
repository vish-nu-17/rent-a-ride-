import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast, Toaster } from "sonner";
import {
  MdDriveEta,
  MdVerifiedUser,
  MdCloudUpload,
  MdCheckCircle,
  MdErrorOutline,
  MdDeleteOutline,
  MdRefresh,
  MdArrowBack,
  MdVisibility,
} from "react-icons/md";
import { FaIdCard, FaFilePdf, FaCar, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { FaIndianRupeeSign } from "react-icons/fa6";

const DocumentVerification = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // File states
  const [licenceFile, setLicenceFile] = useState(null);
  const [licencePreview, setLicencePreview] = useState(null);
  const [idFile, setIdFile] = useState(null);
  const [idPreview, setIdPreview] = useState(null);

  // Drag and drop states
  const [isLicenceDragging, setIsLicenceDragging] = useState(false);
  const [isIdDragging, setIsIdDragging] = useState(false);

  // Document modal preview
  const [previewModal, setPreviewModal] = useState({ open: false, title: "", url: "", isPdf: false });

  const licenceInputRef = useRef(null);
  const idInputRef = useRef(null);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/user/bookingDetails/${bookingId}`);
      if (!res.ok) {
        throw new Error("Unable to load booking details");
      }
      const data = await res.json();
      setBooking(data.bookingDetails);
      setVehicle(data.vehicleDetails);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to load booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  // Validation function
  const validateFile = (file) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file format. Only JPG, PNG, and PDF files are allowed.");
      return false;
    }
    if (file.size > maxSize) {
      toast.error("File size exceeds 5 MB limit. Please choose a smaller file.");
      return false;
    }
    return true;
  };

  const handleLicenceChange = (file) => {
    if (!file) return;
    if (!validateFile(file)) return;

    setLicenceFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setLicencePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setLicencePreview("pdf");
    }
    toast.success("Driving licence selected successfully");
  };

  const handleIdChange = (file) => {
    if (!file) return;
    if (!validateFile(file)) return;

    setIdFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setIdPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setIdPreview("pdf");
    }
    toast.success("Identity verification document selected");
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!licenceFile && !booking?.drivingLicence) {
      toast.error("Please upload your Driving Licence document.");
      return;
    }

    if (!idFile && !booking?.idProof) {
      toast.error("Please upload an Identity Verification document.");
      return;
    }

    try {
      setSubmitting(true);
      setUploadProgress(20);

      const formData = new FormData();
      if (licenceFile) {
        formData.append("drivingLicence", licenceFile);
      }
      if (idFile) {
        formData.append("idProof", idFile);
      }

      setUploadProgress(50);

      const res = await fetch(`/api/user/uploadBookingDocuments/${bookingId}`, {
        method: "POST",
        body: formData,
      });

      setUploadProgress(90);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit documents");
      }

      setUploadProgress(100);
      toast.success("Documents submitted successfully for administrator verification!");

      setTimeout(() => {
        navigate(`/bookingConfirmation/${bookingId}`);
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error submitting documents");
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent mb-4"></div>
        <p className="text-gray-700 font-medium">Loading booking and document details...</p>
      </div>
    );
  }

  const isRejected = booking?.verificationStatus === "rejected";
  const isApproved = booking?.verificationStatus === "approved";

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" richColors />

      <div className="max-w-4xl mx-auto">
        {/* Navigation back */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <MdArrowBack className="text-lg" /> Back to My Bookings
          </Link>
          <span className="text-xs bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full">
            Tamil Nadu Car Rental
          </span>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-sm shadow">
                ✓
              </span>
              <div className="text-left">
                <p className="text-xs text-slate-400 font-bold uppercase">Step 1-3</p>
                <p className="text-sm font-semibold text-slate-700">Vehicle & Dates Selected</p>
              </div>
            </div>

            <div className="hidden md:block w-12 h-0.5 bg-slate-200"></div>

            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-sm shadow">
                ✓
              </span>
              <div className="text-left">
                <p className="text-xs text-slate-400 font-bold uppercase">Step 4</p>
                <p className="text-sm font-semibold text-slate-700">Details Reviewed</p>
              </div>
            </div>

            <div className="hidden md:block w-12 h-0.5 bg-blue-400"></div>

            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md ring-4 ring-blue-100">
                5
              </span>
              <div className="text-left">
                <p className="text-xs text-blue-600 font-bold uppercase">Current Step</p>
                <p className="text-sm font-bold text-slate-900">Document Verification</p>
              </div>
            </div>

            <div className="hidden md:block w-12 h-0.5 bg-slate-200"></div>

            <div className="flex items-center gap-3 opacity-60">
              <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-sm">
                6
              </span>
              <div className="text-left">
                <p className="text-xs text-slate-400 font-bold uppercase">Final Step</p>
                <p className="text-sm font-semibold text-slate-700">Booking Confirmed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rejection Alert Banner if rejected */}
        {isRejected && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-5 mb-8 shadow-sm">
            <div className="flex items-start gap-4">
              <MdErrorOutline className="text-red-600 text-2xl flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-red-900">
                  Documents Rejected by Administrator
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  <strong>Reason:</strong> {booking?.rejectionReason || "Uploaded documents did not meet requirements."}
                </p>
                <p className="text-xs text-red-600 mt-2 font-medium">
                  Please review the feedback above, upload replacement documents, and submit again for verification.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Booking Summary Card */}
        {booking && vehicle && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Booking Summary</span>
              <span className="text-xs font-mono font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
                Ref: #{booking._id?.slice(0, 10)}
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              <div className="md:col-span-1">
                <img
                  src={vehicle?.image?.[0] || "https://evmwheels.com/front-theme/images/Group%20316.png"}
                  alt={vehicle?.name}
                  className="w-full h-32 object-contain bg-slate-50 rounded-lg p-2 border border-slate-100"
                />
              </div>

              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Vehicle</p>
                  <p className="text-base font-bold text-slate-800 capitalize">{vehicle?.name}</p>
                  <span className="inline-block mt-1 text-xs bg-blue-50 text-blue-700 font-mono px-2 py-0.5 rounded font-semibold border border-blue-200">
                    {vehicle?.registeration_number}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Location (Tamil Nadu)</p>
                  <p className="text-sm font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <FaMapMarkerAlt className="text-red-500 text-xs flex-shrink-0" />
                    <span>{booking.pickUpLocation}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1 capitalize">
                    District: <strong className="text-slate-700">{booking.pickUpDistrict}</strong>
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Total Fare</p>
                  <p className="text-lg font-extrabold text-slate-900 flex items-center mt-0.5">
                    <FaIndianRupeeSign className="text-sm" />
                    <span>{booking.totalPrice}</span>
                  </p>
                  <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800">
                    {booking.documentStatus === "submitted"
                      ? "Awaiting Verification"
                      : isRejected
                      ? "Needs Re-upload"
                      : "Documents Required"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section A: Driving Licence */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg text-white">
                  <FaIdCard className="text-xl" />
                </div>
                <div>
                  <h3 className="text-base font-bold">A. Driving Licence Document</h3>
                  <p className="text-xs text-slate-300">
                    Upload a clear scanned copy or photo of your Driving Licence
                  </p>
                </div>
              </div>
              <span className="text-xs bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full font-medium">
                Required
              </span>
            </div>

            <div className="p-6">
              <input
                type="file"
                ref={licenceInputRef}
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => handleLicenceChange(e.target.files[0])}
              />

              {!licenceFile && !booking?.drivingLicence ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsLicenceDragging(true);
                  }}
                  onDragLeave={() => setIsLicenceDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsLicenceDragging(false);
                    if (e.dataTransfer.files?.[0]) handleLicenceChange(e.dataTransfer.files[0]);
                  }}
                  onClick={() => licenceInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isLicenceDragging
                      ? "border-blue-500 bg-blue-50/50"
                      : "border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50"
                  }`}
                >
                  <MdCloudUpload className="mx-auto text-4xl text-slate-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">
                    Click to browse or drag and drop your Driving Licence
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Accepted formats: JPG, JPEG, PNG, PDF (Maximum 5 MB)
                  </p>
                  <button
                    type="button"
                    className="mt-4 px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-sm transition"
                  >
                    Select Driving Licence File
                  </button>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {licencePreview === "pdf" ? (
                        <FaFilePdf className="text-3xl text-red-500" />
                      ) : licencePreview ? (
                        <img src={licencePreview} alt="Licence preview" className="w-full h-full object-cover" />
                      ) : (
                        <FaIdCard className="text-2xl text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 break-all">
                        {licenceFile ? licenceFile.name : booking?.drivingLicence}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {licenceFile ? formatFileSize(licenceFile.size) : "Previously uploaded document on server"}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
                        <MdCheckCircle /> Ready for verification
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => licenceInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-md text-xs font-semibold text-slate-700 shadow-sm"
                    >
                      Replace File
                    </button>
                    {licenceFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setLicenceFile(null);
                          setLicencePreview(null);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition"
                        title="Remove file"
                      >
                        <MdDeleteOutline className="text-xl" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section B: Identity Verification (Dummy / Demo ID) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 rounded-lg text-white">
                  <MdVerifiedUser className="text-xl" />
                </div>
                <div>
                  <h3 className="text-base font-bold">B. Identity Verification Document</h3>
                  <p className="text-xs text-slate-300">
                    Upload a valid government-issued identity document
                  </p>
                </div>
              </div>
              <span className="text-xs bg-emerald-500/30 text-emerald-200 px-3 py-1 rounded-full font-medium">
                Required
              </span>
            </div>

            <div className="p-6">
              <input
                type="file"
                ref={idInputRef}
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => handleIdChange(e.target.files[0])}
              />

              {!idFile && !booking?.idProof ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsIdDragging(true);
                  }}
                  onDragLeave={() => setIsIdDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsIdDragging(false);
                    if (e.dataTransfer.files?.[0]) handleIdChange(e.dataTransfer.files[0]);
                  }}
                  onClick={() => idInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isIdDragging
                      ? "border-emerald-500 bg-emerald-50/50"
                      : "border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50"
                  }`}
                >
                  <MdCloudUpload className="mx-auto text-4xl text-slate-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">
                    Click to browse or drag and drop your Identity Document
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Accepted formats: JPG, JPEG, PNG, PDF (Maximum 5 MB)
                  </p>
                  <button
                    type="button"
                    className="mt-4 px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-sm transition"
                  >
                    Select Identity Document File
                  </button>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {idPreview === "pdf" ? (
                        <FaFilePdf className="text-3xl text-red-500" />
                      ) : idPreview ? (
                        <img src={idPreview} alt="Demo ID preview" className="w-full h-full object-cover" />
                      ) : (
                        <MdVerifiedUser className="text-2xl text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 break-all">
                        {idFile ? idFile.name : booking?.idProof}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {idFile ? formatFileSize(idFile.size) : "Previously uploaded document on server"}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
                        <MdCheckCircle /> Ready for verification
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => idInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-md text-xs font-semibold text-slate-700 shadow-sm"
                    >
                      Replace File
                    </button>
                    {idFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setIdFile(null);
                          setIdPreview(null);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition"
                        title="Remove file"
                      >
                        <MdDeleteOutline className="text-xl" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress Bar if submitting */}
          {submitting && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700">Uploading & Securing Documents...</span>
                <span className="text-xs font-bold text-blue-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <p className="text-xs text-slate-500">
              * Note: Submitting documents keeps your booking in a <strong>pending verification</strong> state until an administrator reviews and approves them.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                submitting
                  ? "bg-slate-400 text-slate-200 cursor-not-allowed"
                  : isRejected
                  ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200"
                  : "bg-slate-900 hover:bg-black text-white shadow-slate-300"
              }`}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Uploading Documents...</span>
                </>
              ) : isRejected ? (
                <>
                  <MdRefresh className="text-lg" />
                  <span>Resubmit Replacement Documents</span>
                </>
              ) : (
                <>
                  <MdCheckCircle className="text-lg text-emerald-400" />
                  <span>Submit Documents for Verification</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentVerification;

