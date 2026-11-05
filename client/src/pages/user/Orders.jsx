import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { MdCurrencyRupee, MdHourglassTop, MdCheckCircle, MdErrorOutline } from "react-icons/md";
import { IoMdTime } from "react-icons/io";
import { CiCalendarDate, CiLocationOn } from "react-icons/ci";
import { FaIdCard, FaCarSide } from "react-icons/fa";
import UserOrderDetailsModal from "../../components/UserOrderDetailsModal";
import { setIsOrderModalOpen, setSingleOrderDetails } from "../../redux/user/userSlice";

export default function Orders() {
  const { _id } = useSelector((state) => state.user.currentUser);
  const [bookings, setBookings] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/user/findBookingsOfUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: _id,
        }),
      });

      const data = await res.json();
      if (data) {
        setBookings(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDetailsModal = (item) => {
    dispatch(setIsOrderModalOpen(true));
    dispatch(
      setSingleOrderDetails({
        bookingDetails: item.bookingDetails,
        vehicleDetails: item.vehicleDetails,
      })
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <UserOrderDetailsModal />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Your Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your Tamil Nadu car bookings and document verification status
          </p>
        </div>
        <Link
          to="/"
          className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-black transition"
        >
          Book Another Car
        </Link>
      </div>

      <div className="mb-8">
        {!bookings || bookings.length === 0 ? (
          <div className="font-extrabold text-black flex flex-col justify-center items-center min-h-[400px] bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <FaCarSide className="text-5xl text-slate-300 mb-3" />
            <p className="text-base text-slate-600 font-bold">No Bookings Yet</p>
            <p className="text-xs text-slate-400 mt-1">Your reservations will appear here</p>
          </div>
        ) : (
          bookings.map((cur, idx) => {
            const pickupDate = new Date(cur.bookingDetails.pickupDate);
            const dropoffDate = new Date(cur.bookingDetails.dropOffDate);
            const verificationStatus = cur.bookingDetails.verificationStatus || "pending";
            const isApproved = verificationStatus === "approved" || cur.bookingDetails.status === "booked";
            const isRejected = verificationStatus === "rejected";
            const isPending = !isApproved && !isRejected;

            return (
              <div
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 md:p-6 mb-5 transition hover:shadow-md"
                key={idx}
              >
                {/* Status Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
                      ID: #{cur.bookingDetails._id?.slice(0, 10)}
                    </span>

                    {/* Verification Status Badge */}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        <MdHourglassTop /> Verification Pending
                      </span>
                    )}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <MdCheckCircle /> Booking Confirmed ✓
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-0.5 rounded-full bg-red-100 text-red-800">
                        <MdErrorOutline /> Documents Rejected
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-400">
                    District: <strong className="text-slate-700 capitalize">{cur.bookingDetails.pickUpDistrict || "Tamil Nadu"}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div>
                    <img
                      alt={cur.vehicleDetails?.name}
                      className="w-full h-36 object-contain bg-slate-50 rounded-lg p-2 border border-slate-100"
                      src={cur.vehicleDetails?.image?.[0]}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 capitalize">
                          {cur.vehicleDetails?.name} ({cur.vehicleDetails?.model})
                        </h3>
                        <span className="inline-block mt-0.5 font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          {cur.vehicleDetails?.registeration_number || "TN-01-AB-1001"}
                        </span>
                      </div>

                      <p className="text-lg font-black text-slate-900 flex items-center">
                        <MdCurrencyRupee className="text-sm" />
                        <span>{cur.bookingDetails.totalPrice}</span>
                      </p>
                    </div>

                    {/* Locations & Dates */}
                    <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
                      <div>
                        <p className="font-bold text-slate-400 uppercase text-[10px]">Pick Up (TN)</p>
                        <p className="text-slate-800 font-semibold flex items-center gap-1 mt-0.5">
                          <CiLocationOn className="text-red-500 font-bold" />
                          <span>{cur.bookingDetails.pickUpLocation}</span>
                        </p>
                        <p className="text-slate-500 flex items-center gap-1 mt-1">
                          <CiCalendarDate />
                          <span>{pickupDate.toLocaleDateString("en-IN")}</span>
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-slate-400 uppercase text-[10px]">Drop Off (TN)</p>
                        <p className="text-slate-800 font-semibold flex items-center gap-1 mt-0.5">
                          <CiLocationOn className="text-red-500 font-bold" />
                          <span>{cur.bookingDetails.dropOffLocation}</span>
                        </p>
                        <p className="text-slate-500 flex items-center gap-1 mt-1">
                          <CiCalendarDate />
                          <span>{dropoffDate.toLocaleDateString("en-IN")}</span>
                        </p>
                      </div>
                    </div>

                    {/* Rejection alert */}
                    {isRejected && cur.bookingDetails.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 mt-3 text-xs text-red-700">
                        <strong>Rejection Reason:</strong> {cur.bookingDetails.rejectionReason}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-3 mt-5">
                      <button
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs transition"
                        onClick={() => handleDetailsModal(cur)}
                      >
                        Details
                      </button>

                      {/* Go to Confirmation Page */}
                      <Link
                        to={`/bookingConfirmation/${cur.bookingDetails._id}`}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                          isApproved
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                            : "bg-slate-900 hover:bg-black text-white"
                        }`}
                      >
                        {isApproved ? "View Confirmation ✓" : "Verification Status"}
                      </Link>

                      {/* Document upload button if not approved */}
                      {!isApproved && (
                        <Link
                          to={`/documentVerification/${cur.bookingDetails._id}`}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                        >
                          <FaIdCard />
                          <span>{isRejected ? "Re-upload Documents" : "Upload / Edit Documents"}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
