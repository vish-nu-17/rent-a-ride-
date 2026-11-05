import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import {
  MdCheckCircle,
  MdCancel,
  MdHourglassTop,
  MdSearch,
  MdVisibility,
  MdClose,
  MdRefresh,
  MdVerifiedUser,
  MdDirectionsCar,
  MdCalendarToday,
  MdLocationOn,
} from "react-icons/md";
import { FaIdCard, FaFilePdf, FaRegClock } from "react-icons/fa";
import { FaIndianRupeeSign } from "react-icons/fa6";

const AdminDocumentVerification = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [docModal, setDocModal] = useState({ open: false, title: "", url: "", isPdf: false });
  const [rejectModal, setRejectModal] = useState({ open: false, bookingId: null, reason: "" });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      const res = await fetch("/api/admin/documentVerificationRequests", {
        headers: {
          Authorization: `Bearer ${refreshToken},${accessToken}`,
        },
      });

      if (!res.ok) {
        if (res.status === 403) {
          toast.error("Access denied. Administrator privileges required.");
          return;
        }
        throw new Error("Failed to fetch verification requests");
      }

      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Filter requests based on tab and search
  const filteredRequests = requests.filter((req) => {
    // Tab filter
    if (activeTab === "pending" && req.verificationStatus !== "pending") return false;
    if (activeTab === "approved" && req.verificationStatus !== "approved") return false;
    if (activeTab === "rejected" && req.verificationStatus !== "rejected") return false;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const bookingId = (req._id || "").toLowerCase();
      const username = (req.userDetails?.username || "").toLowerCase();
      const email = (req.userDetails?.email || "").toLowerCase();
      const reg = (req.vehicleDetails?.registeration_number || "").toLowerCase();
      const carName = (req.vehicleDetails?.name || "").toLowerCase();

      return (
        bookingId.includes(term) ||
        username.includes(term) ||
        email.includes(term) ||
        reg.includes(term) ||
        carName.includes(term)
      );
    }
    return true;
  });

  const pendingCount = requests.filter((r) => r.verificationStatus === "pending").length;
  const approvedCount = requests.filter((r) => r.verificationStatus === "approved").length;
  const rejectedCount = requests.filter((r) => r.verificationStatus === "rejected").length;

  const handleApprove = async (bookingId) => {
    try {
      setActionLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      const res = await fetch("/api/admin/verifyDocuments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refreshToken},${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          action: "approve",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Approval failed");
      }

      toast.success("Documents approved! Booking is now confirmed.");
      await fetchRequests();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error approving documents");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectModal.reason.trim()) {
      toast.error("Please enter a rejection reason.");
      return;
    }

    try {
      setActionLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      const res = await fetch("/api/admin/verifyDocuments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refreshToken},${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: rejectModal.bookingId,
          action: "reject",
          rejectionReason: rejectModal.reason,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Rejection failed");
      }

      toast.success("Documents marked as rejected. Customer will be notified to resubmit.");
      setRejectModal({ open: false, bookingId: null, reason: "" });
      await fetchRequests();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error rejecting documents");
    } finally {
      setActionLoading(false);
    }
  };

  const openDocumentViewer = (bookingId, docType, label) => {
    const accessToken = localStorage.getItem("accessToken") || "";
    const url = `/api/user/document/${bookingId}/${docType}?token=${accessToken}`;
    const filename = requests.find((r) => r._id === bookingId)?.[docType] || "";
    const isPdf = filename.toLowerCase().endsWith(".pdf");

    setDocModal({
      open: true,
      title: `${label} (Booking #${bookingId.slice(0, 8)})`,
      url,
      isPdf,
    });
  };

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
    <div className="p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MdVerifiedUser className="text-blue-600" />
            <span>Document Verification Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review customer driving licences and dummy demonstration identity documents to approve or reject car bookings.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
        >
          <MdRefresh className="text-base" /> Refresh List
        </button>
      </div>

      {/* Top Filter & Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "pending"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>Pending Review</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === "pending" ? "bg-amber-800 text-white" : "bg-slate-200 text-slate-700"}`}>
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("approved")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "approved"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>Approved & Confirmed</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === "approved" ? "bg-emerald-800 text-white" : "bg-slate-200 text-slate-700"}`}>
              {approvedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("rejected")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "rejected"
                ? "bg-red-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>Rejected</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === "rejected" ? "bg-red-800 text-white" : "bg-slate-200 text-slate-700"}`}>
              {rejectedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "all"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All History ({requests.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <MdSearch className="absolute left-3 top-2.5 text-slate-400 text-lg" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, user, reg #..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mx-auto mb-3"></div>
          <p className="text-sm font-semibold text-slate-600">Loading document verification queue...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <MdVerifiedUser className="mx-auto text-5xl text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">No verification requests found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {activeTab === "pending"
              ? "All submitted customer documents have been reviewed!"
              : "No records match the current filter criteria."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((item) => {
            const isItemPending = item.verificationStatus === "pending";
            const isItemApproved = item.verificationStatus === "approved";
            const isItemRejected = item.verificationStatus === "rejected";

            return (
              <div
                key={item._id}
                className={`bg-white rounded-xl shadow-sm border p-6 transition-all ${
                  isItemPending
                    ? "border-amber-300 bg-amber-50/10 hover:shadow-md"
                    : isItemApproved
                    ? "border-emerald-200"
                    : "border-red-200"
                }`}
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2.5 py-1 rounded">
                      ID: #{item._id.slice(0, 10)}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-0.5 rounded-full ${
                        isItemPending
                          ? "bg-amber-100 text-amber-800"
                          : isItemApproved
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {isItemPending && <MdHourglassTop />}
                      {isItemApproved && <MdCheckCircle />}
                      {isItemRejected && <MdCancel />}
                      <span className="capitalize">Verification: {item.verificationStatus || "Pending"}</span>
                    </span>

                    <span className="text-xs text-slate-500 font-medium">
                      Submission: <strong className="text-slate-700">{item.documentStatus}</strong>
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <FaRegClock /> Submitted: {formatDateTime(item.submittedAt || item.createdAt)}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 my-4 py-2">
                  {/* Customer Information */}
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400">Customer</p>
                    <p className="text-sm font-bold text-slate-800 mt-1 capitalize">
                      {item.userDetails?.username || "Demo User"}
                    </p>
                    <p className="text-xs text-slate-500">{item.userDetails?.email || "user@local.com"}</p>
                    <p className="text-[11px] text-slate-400 mt-1">User ID: {item.userId?.slice(0, 10)}</p>
                  </div>

                  {/* Vehicle Information */}
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400">Vehicle (Tamil Nadu)</p>
                    <p className="text-sm font-bold text-slate-800 mt-1 capitalize">
                      {item.vehicleDetails?.name || "Alto 800"} ({item.vehicleDetails?.company})
                    </p>
                    <span className="inline-block mt-1 font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      {item.vehicleDetails?.registeration_number || "TN-01-AB-1001"}
                    </span>
                  </div>

                  {/* Trip Details */}
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400">Locations & Schedule</p>
                    <p className="text-xs font-semibold text-slate-700 flex items-center gap-1 mt-1">
                      <MdLocationOn className="text-red-500 text-sm flex-shrink-0" />
                      <span>{item.pickUpLocation} ({item.pickUpDistrict})</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <MdCalendarToday className="text-slate-400" />
                      <span>{formatDateTime(item.pickupDate)}</span>
                    </p>
                  </div>

                  {/* Price & Current Booking Status */}
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400">Booking Amount</p>
                    <p className="text-lg font-black text-slate-900 flex items-center mt-0.5">
                      <FaIndianRupeeSign className="text-sm" />
                      <span>{item.totalPrice}</span>
                    </p>
                    <span className="inline-block text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded mt-1 capitalize">
                      Status: {item.status}
                    </span>
                  </div>
                </div>

                {/* Rejection notice if previously rejected */}
                {isItemRejected && item.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 my-3 text-xs text-red-800">
                    <strong>Rejection Reason Provided:</strong> {item.rejectionReason}
                    {item.reviewedAt && <span className="ml-2 text-slate-500">({formatDateTime(item.reviewedAt)})</span>}
                  </div>
                )}

                {/* Document review badges & Action buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-slate-100">
                  {/* Documents uploaded */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-slate-500">Documents:</span>

                    {/* Driving Licence Button */}
                    {item.drivingLicence ? (
                      <button
                        type="button"
                        onClick={() => openDocumentViewer(item._id, "drivingLicence", "Driving Licence")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition shadow-sm"
                      >
                        <FaIdCard />
                        <span>View Driving Licence</span>
                        <MdVisibility className="text-sm ml-0.5" />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Licence not uploaded</span>
                    )}

                    {/* Dummy ID Proof Button */}
                    {item.idProof ? (
                      <button
                        type="button"
                        onClick={() => openDocumentViewer(item._id, "idProof", "Identity Verification (Demo ID)")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition shadow-sm"
                      >
                        <MdVerifiedUser />
                        <span>View Demo ID Proof</span>
                        <MdVisibility className="text-sm ml-0.5" />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">ID proof not uploaded</span>
                    )}
                  </div>

                  {/* Actions for Admin */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {/* Approve button */}
                    <button
                      type="button"
                      disabled={actionLoading || isItemApproved}
                      onClick={() => handleApprove(item._id)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5 ${
                        isItemApproved
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
                      }`}
                    >
                      <MdCheckCircle className="text-base" />
                      <span>{isItemApproved ? "Approved ✓" : "Approve Documents"}</span>
                    </button>

                    {/* Reject button */}
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => setRejectModal({ open: true, bookingId: item._id, reason: "" })}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <MdCancel className="text-base" />
                      <span>{isItemRejected ? "Update Rejection" : "Reject"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {docModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-900 text-white">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <MdVisibility className="text-blue-400 text-base" />
                <span>{docModal.title}</span>
              </h3>
              <button
                onClick={() => setDocModal({ open: false, title: "", url: "", isPdf: false })}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            <div className="p-6 overflow-auto flex-1 flex items-center justify-center bg-slate-100 min-h-[350px]">
              {docModal.isPdf ? (
                <iframe
                  src={docModal.url}
                  title="Document PDF"
                  className="w-full h-[550px] border border-slate-300 rounded-lg bg-white"
                />
              ) : (
                <img
                  src={docModal.url}
                  alt="Uploaded document preview"
                  className="max-h-[550px] max-w-full object-contain rounded-lg shadow-sm border border-slate-200 bg-white"
                />
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
              <span>Secure document served through authenticated backend controller</span>
              <a
                href={docModal.url}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-blue-600 hover:underline"
              >
                Open in Full Window
              </a>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MdCancel className="text-red-600 text-xl" />
                <span>Reject Customer Documents</span>
              </h3>
              <button
                onClick={() => setRejectModal({ open: false, bookingId: null, reason: "" })}
                className="text-slate-400 hover:text-slate-700"
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit}>
              <p className="text-xs text-slate-600 mb-3">
                Please provide a clear reason for rejecting the documents. This explanation will be displayed to the customer so they can upload correct replacement files:
              </p>

              <textarea
                rows={4}
                required
                value={rejectModal.reason}
                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                placeholder="e.g., Driving licence photo is blurry or unreadable. Please upload a clear scanned copy."
                className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRejectModal({ open: false, bookingId: null, reason: "" })}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-md shadow-red-200 transition"
                >
                  {actionLoading ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDocumentVerification;

