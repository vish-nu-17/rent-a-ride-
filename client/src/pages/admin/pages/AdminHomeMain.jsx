import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdDirectionsCar,
  MdPeople,
  MdBookmark,
  MdVerifiedUser,
  MdStorefront,
  MdCurrencyRupee,
  MdArrowForward,
  MdRefresh,
} from "react-icons/md";
import { FaIndianRupeeSign } from "react-icons/fa6";

const StatCard = ({ icon, label, value, color, bgColor, onClick, loading }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 group`}
  >
    <div className={`p-3 rounded-xl ${bgColor} flex-shrink-0`}>
      <div className={`text-2xl ${color}`}>{icon}</div>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{label}</p>
      {loading ? (
        <div className="h-7 w-16 bg-slate-100 rounded animate-pulse mt-1" />
      ) : (
        <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{value}</p>
      )}
    </div>
    <MdArrowForward className="text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
  </div>
);

const AdminHomeMain = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [vendorRequests, setVendorRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [bookingsRes, vehiclesRes, vendorRes] = await Promise.all([
        fetch("/api/admin/allBookings"),
        fetch("/api/admin/showVehicles"),
        fetch("/api/admin/fetchVendorVehilceRequests"),
      ]);
      const [bookingsData, vehiclesData, vendorData] = await Promise.all([
        bookingsRes.json(),
        vehiclesRes.json(),
        vendorRes.json(),
      ]);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      setVendorRequests(Array.isArray(vendorData) ? vendorData : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Computed stats
  const activeBookings = bookings.filter((b) =>
    ["booked", "pending_verification"].includes(b.status)
  );
  const pendingVerifications = bookings.filter(
    (b) => b.documentStatus === "submitted" && b.verificationStatus === "pending"
  );
  const confirmedBookings = bookings.filter((b) => b.status === "booked");
  const totalRevenue = confirmedBookings.reduce(
    (sum, b) => sum + (Number(b.totalPrice) || 0),
    0
  );
  // Unique customers from bookings
  const uniqueUserIds = new Set(bookings.map((b) => String(b.userId)).filter(Boolean));
  const totalCustomers = uniqueUserIds.size;

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 6);

  const statusColor = {
    booked: "bg-emerald-100 text-emerald-700",
    pending_verification: "bg-amber-100 text-amber-700",
    cancelled: "bg-red-100 text-red-700",
    pending: "bg-slate-100 text-slate-600",
  };

  const statusLabel = {
    booked: "Confirmed",
    pending_verification: "Pending Verification",
    cancelled: "Cancelled",
    pending: "Pending",
  };

  return (
    <div className="mt-10 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tamil Nadu Car Rental — Live Overview</p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm hover:bg-slate-50 transition"
        >
          <MdRefresh className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6 font-medium">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<MdPeople />}
          label="Total Customers"
          value={totalCustomers}
          color="text-blue-600"
          bgColor="bg-blue-50"
          loading={loading}
          onClick={() => navigate("/adminDashboard/allUsers")}
        />
        <StatCard
          icon={<MdDirectionsCar />}
          label="Total Vehicles"
          value={vehicles.length}
          color="text-indigo-600"
          bgColor="bg-indigo-50"
          loading={loading}
          onClick={() => navigate("/adminDashboard/allProduct")}
        />
        <StatCard
          icon={<MdBookmark />}
          label="Active Bookings"
          value={activeBookings.length}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
          loading={loading}
          onClick={() => navigate("/adminDashboard/orders")}
        />
        <StatCard
          icon={<MdVerifiedUser />}
          label="Pending Verifications"
          value={pendingVerifications.length}
          color="text-amber-600"
          bgColor="bg-amber-50"
          loading={loading}
          onClick={() => navigate("/adminDashboard/documentVerification")}
        />
        <StatCard
          icon={<MdStorefront />}
          label="Pending Vendor Requests"
          value={vendorRequests.length}
          color="text-purple-600"
          bgColor="bg-purple-50"
          loading={loading}
          onClick={() => navigate("/adminDashboard/vendorVehicleRequests")}
        />
        <StatCard
          icon={<FaIndianRupeeSign />}
          label="Total Revenue (Confirmed)"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          color="text-rose-600"
          bgColor="bg-rose-50"
          loading={loading}
          onClick={() => navigate("/adminDashboard/orders")}
        />
      </div>

      {/* Quick Actions */}
      {!loading && (pendingVerifications.length > 0 || vendorRequests.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
          <h2 className="text-sm font-bold text-amber-900 mb-3 uppercase tracking-wide">
            ⚡ Quick Actions — Pending Approvals
          </h2>
          <div className="flex flex-wrap gap-3">
            {pendingVerifications.length > 0 && (
              <button
                onClick={() => navigate("/adminDashboard/documentVerification")}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
              >
                <MdVerifiedUser />
                Review {pendingVerifications.length} Document{pendingVerifications.length !== 1 ? "s" : ""}
              </button>
            )}
            {vendorRequests.length > 0 && (
              <button
                onClick={() => navigate("/adminDashboard/vendorVehicleRequests")}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
              >
                <MdStorefront />
                Review {vendorRequests.length} Vendor Request{vendorRequests.length !== 1 ? "s" : ""}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Recent Bookings</h2>
          <button
            onClick={() => navigate("/adminDashboard/orders")}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
          >
            View All <MdArrowForward />
          </button>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="text-center py-14 text-slate-400">
            <MdBookmark className="mx-auto text-4xl mb-2 opacity-30" />
            <p className="text-sm font-medium">No bookings yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentBookings.map((booking) => (
              <div
                key={booking._id}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <MdDirectionsCar className="text-slate-500 text-lg" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 capitalize truncate">
                      {booking.vehicleDetails?.name || booking.vehicleDetails?.model || "Vehicle"}
                    </p>
                    <p className="text-xs text-slate-400 font-mono truncate">
                      #{String(booking._id).slice(0, 10)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-0.5 justify-end">
                      <FaIndianRupeeSign className="text-xs" />
                      {Number(booking.totalPrice || 0).toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-slate-400">
                      {booking.pickUpLocation || booking.pickup_location || ""}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      statusColor[booking.status] || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {statusLabel[booking.status] || booking.status || "Unknown"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHomeMain;
