import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import {
  MdCheckCircle,
  MdHourglassTop,
  MdErrorOutline,
  MdArrowBack,
  MdRefresh,
  MdPrint,
  MdVerifiedUser,
} from "react-icons/md";
import { FaCar, FaMapMarkerAlt, FaCalendarAlt, FaIdCard } from "react-icons/fa";
import { FaIndianRupeeSign } from "react-icons/fa6";

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/user/bookingDetails/${bookingId}`);
      if (!res.ok) throw new Error("Could not find booking");
      const data = await res.json();
      setBooking(data.bookingDetails);
      setVehicle(data.vehicleDetails);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load booking status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 py-12">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent mb-4"></div>
        <p className="text-slate-700 font-medium">Checking booking and verification status...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 py-12 px-4">
        <MdErrorOutline className="text-5xl text-slate-400 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Booking Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">We could not retrieve details for booking #{bookingId}</p>
        <Link
          to="/orders"
          className="mt-5 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition"
        >
          Go to My Bookings
        </Link>
      </div>
    );
  }

  const isApproved = booking.verificationStatus === "approved" || booking.status === "booked";
  const isRejected = booking.verificationStatus === "rejected";
  const isPending = !isApproved && !isRejected;

  const confirmationNumber = `RR-TN-${booking._id ? booking._id.replace(/-/g, "").slice(0, 8).toUpperCase() : "CONFIRMED"}`;

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" richColors />

      <div className="max-w-3xl mx-auto">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <MdArrowBack className="text-lg" /> All My Bookings
          </Link>
          <button
            onClick={fetchBooking}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
          >
            <MdRefresh className="text-base" /> Refresh Status
          </button>
        </div>

        {/* STATUS CARD */}
        {isPending && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 sm:p-8 mb-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
              <MdHourglassTop />
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-amber-950 mb-2">
              Your booking is awaiting document verification. Confirmation will be available after approval.
            </h1>

            <p className="text-sm text-amber-800 max-w-xl mx-auto mt-2 leading-relaxed">
              We have received your booking details and submitted verification documents. An authorized administrator is currently reviewing your documents. Once approved, your booking status will immediately update to <strong>Confirmed</strong>.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
                Verification Status: Pending Administrator Review
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800">
                Booking Status: Pending Verification
              </span>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 sm:p-8 mb-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
              <MdErrorOutline />
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-red-950 mb-2">
              Document Verification Rejected
            </h1>

            <div className="bg-white border border-red-200 rounded-xl p-4 my-4 max-w-lg mx-auto text-left shadow-sm">
              <p className="text-xs uppercase font-bold text-red-700">Administrator Rejection Reason:</p>
              <p className="text-sm font-semibold text-slate-800 mt-1">
                "{booking.rejectionReason || "Uploaded documents were unclear or invalid."}"
              </p>
            </div>

            <p className="text-xs text-red-700 max-w-md mx-auto mb-5">
              Please submit replacement documents to continue with this booking. Your vehicle reservation is held while you resubmit.
            </p>

            <button
              onClick={() => navigate(`/documentVerification/${booking._id}`)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-md shadow-red-200 transition"
            >
              Re-upload Replacement Documents Now
            </button>
          </div>
        )}

        {isApproved && (
          <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-6 sm:p-8 mb-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
              <MdCheckCircle />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 mb-1">
              Booking Confirmed!
            </h1>
            <p className="text-sm text-emerald-800 font-medium">
              Your verification documents have been reviewed and approved by the administrator.
            </p>

            <div className="bg-white border border-emerald-200 rounded-xl p-4 my-5 max-w-md mx-auto shadow-sm">
              <p className="text-xs text-slate-400 uppercase font-bold">Booking Confirmation Number</p>
              <p className="text-xl sm:text-2xl font-mono font-extrabold text-emerald-700 tracking-wider mt-0.5">
                {confirmationNumber}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-200 text-emerald-900">
                <MdVerifiedUser className="text-sm" /> Documents Approved & Verified
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
                Booking Status: Confirmed
              </span>
            </div>
          </div>
        )}

        {/* DETAILED BOOKING SPEC SHEET */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase font-bold text-slate-400">Order Reference</p>
              <h2 className="text-lg font-bold text-slate-800 font-mono">#{booking._id}</h2>
            </div>
            {isApproved && (
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                <MdPrint className="text-base" /> Print Receipt
              </button>
            )}
          </div>

          {/* Vehicle Information */}
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-bold uppercase text-slate-400 mb-4">Vehicle Information</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-full sm:w-44 h-28 bg-white rounded-xl p-2 border border-slate-200 flex items-center justify-center">
                <img
                  src={vehicle?.image?.[0] || "https://evmwheels.com/front-theme/images/Group%20316.png"}
                  alt={vehicle?.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                <div>
                  <p className="text-xs text-slate-400">Vehicle Name & Model</p>
                  <p className="text-sm font-bold text-slate-800 capitalize mt-0.5">{vehicle?.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{vehicle?.model}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Registration Number</p>
                  <p className="text-sm font-mono font-bold text-blue-700 mt-0.5">
                    {vehicle?.registeration_number || "TN-01-AB-1001"}
                  </p>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold uppercase">
                    Tamil Nadu RTO
                  </span>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Fuel & Transmission</p>
                  <p className="text-sm font-semibold text-slate-800 capitalize mt-0.5">
                    {vehicle?.fuel_type} • {vehicle?.transmition}
                  </p>
                  <p className="text-xs text-slate-500">{vehicle?.seats} Seats</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Dates Schedule */}
          <div className="p-6 sm:p-8 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pickup */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-blue-700 mb-2">
                <FaMapMarkerAlt /> Pick-up Details (Tamil Nadu)
              </div>
              <p className="text-base font-bold text-slate-900">{booking.pickUpLocation}</p>
              <p className="text-xs text-slate-500 mt-0.5 capitalize">District: {booking.pickUpDistrict}</p>
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2 text-xs font-semibold text-slate-700">
                <FaCalendarAlt className="text-slate-400" />
                <span>Pickup Time: {formatDateTime(booking.pickupDate)}</span>
              </div>
            </div>

            {/* Dropoff */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-indigo-700 mb-2">
                <FaMapMarkerAlt /> Return / Drop-off Details
              </div>
              <p className="text-base font-bold text-slate-900">{booking.dropOffLocation}</p>
              <p className="text-xs text-slate-500 mt-0.5 capitalize">District: {booking.pickUpDistrict}</p>
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2 text-xs font-semibold text-slate-700">
                <FaCalendarAlt className="text-slate-400" />
                <span>Return Time: {formatDateTime(booking.dropOffDate)}</span>
              </div>
            </div>
          </div>

          {/* Pricing & Verification Summary */}
          <div className="p-6 sm:p-8 bg-slate-50/30 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-xs text-slate-400 uppercase font-bold">Document Verification Status</p>
              <p className="text-sm font-bold flex items-center justify-center sm:justify-start gap-1.5">
                {isApproved ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <MdCheckCircle /> Verified & Approved by Administrator
                  </span>
                ) : isRejected ? (
                  <span className="text-red-700 flex items-center gap-1">
                    <MdErrorOutline /> Verification Rejected (Action Required)
                  </span>
                ) : (
                  <span className="text-amber-700 flex items-center gap-1">
                    <MdHourglassTop /> Pending Verification Review
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-500">
                Booking Status: <strong className="capitalize">{booking.status}</strong>
              </p>
            </div>

            <div className="text-center sm:text-right">
              <p className="text-xs text-slate-400 uppercase font-bold">Total Booking Amount</p>
              <p className="text-2xl font-black text-slate-900 flex items-center justify-center sm:justify-end mt-0.5">
                <FaIndianRupeeSign className="text-base" />
                <span>{booking.totalPrice}</span>
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold">Taxes & Insurance Included</p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/orders"
            className="px-6 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            View All My Bookings
          </Link>

          {!isApproved && (
            <Link
              to={`/documentVerification/${booking._id}`}
              className="px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-bold shadow-sm transition flex items-center gap-2"
            >
              <FaIdCard />
              <span>{isRejected ? "Re-upload Documents" : "View / Edit Documents"}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;

