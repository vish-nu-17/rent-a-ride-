import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { Button } from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import RefreshIcon from "@mui/icons-material/Refresh";
import toast, { Toaster } from "react-hot-toast";
import { Header } from "../components";
import { MdStorefront, MdCheckCircle } from "react-icons/md";

const AllVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/allVendors");
      if (res.ok) {
        const data = await res.json();
        setVendors(Array.isArray(data) ? data : []);
      } else {
        toast.error("Failed to load vendor partners");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleDeleteVendor = async (vendorId) => {
    if (!window.confirm("Are you sure you want to remove this vendor account?")) return;
    try {
      setVendors((prev) => prev.filter((v) => v._id !== vendorId));
      const res = await fetch(`/api/admin/deleteUser/${vendorId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Vendor partner removed successfully");
      } else {
        toast.error("Failed to remove vendor");
        fetchVendors();
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting vendor");
      fetchVendors();
    }
  };

  const columns = [
    {
      field: "avatar",
      headerName: "Partner",
      width: 90,
      sortable: false,
      renderCell: (params) => {
        const name = params.row.username || "Vendor";
        const avatar =
          params.value ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff&size=150`;
        return (
          <img
            src={avatar}
            alt={name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff&size=150`;
            }}
            className="w-9 h-9 rounded-full object-cover border border-purple-200"
          />
        );
      },
    },
    {
      field: "username",
      headerName: "Vendor / Host Name",
      width: 190,
      renderCell: (params) => (
        <span className="font-semibold text-slate-800">{params.value || "-"}</span>
      ),
    },
    { field: "email", headerName: "Business Email", width: 220 },
    { field: "phoneNumber", headerName: "Contact Number", width: 150 },
    {
      field: "totalVehicles",
      headerName: "Vehicles Hosted",
      width: 140,
      renderCell: (params) => (
        <span className="font-bold text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200 flex items-center gap-1 w-max">
          <MdStorefront /> {params.value} Cars
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: () => (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <MdCheckCircle /> Verified Partner
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Action",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          onClick={() => handleDeleteVendor(params.row.id)}
          title="Delete Vendor"
        >
          <DeleteForeverIcon fontSize="small" className="text-red-500 hover:text-red-700" />
        </Button>
      ),
    },
  ];

  const rows = vendors.map((v) => ({
    id: v._id,
    avatar: v.profilePicture,
    username: v.username,
    email: v.email,
    phoneNumber: v.phoneNumber || "-",
    totalVehicles: v.totalVehicles || 0,
    status: "Verified",
  }));

  return (
    <>
      <Toaster position="top-right" />
      <div className="max-w-[1100px] p-6 md:p-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <Header title="Vendor Partner Management" />
            <p className="text-xs text-slate-500 mt-1">
              Manage external car fleet vendors and hosts across Tamil Nadu ({vendors.length} active partners)
            </p>
          </div>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon className={loading ? "animate-spin" : ""} />}
            onClick={fetchVendors}
            sx={{ textTransform: "none", borderRadius: "8px" }}
          >
            Refresh
          </Button>
        </div>

        <Box sx={{ height: 500, width: "100%", bgcolor: "white", borderRadius: "12px", p: 1, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 8,
                },
              },
            }}
            pageSizeOptions={[5, 8, 15]}
            disableRowSelectionOnClick
            sx={{
              border: "none",
              "& .MuiDataGrid-cell:focus": {
                outline: "none",
              },
            }}
          />
        </Box>
      </div>
    </>
  );
};

export default AllVendors;
