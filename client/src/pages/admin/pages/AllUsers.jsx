import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { Button } from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import RefreshIcon from "@mui/icons-material/Refresh";
import toast, { Toaster } from "react-hot-toast";
import { Header } from "../components";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/allUsers");
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } else {
        toast.error("Failed to load customers");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this customer account?")) return;
    try {
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      const res = await fetch(`/api/admin/deleteUser/${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Customer removed successfully");
      } else {
        toast.error("Failed to delete customer");
        fetchUsers();
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting customer");
      fetchUsers();
    }
  };

  const columns = [
    {
      field: "avatar",
      headerName: "Avatar",
      width: 90,
      sortable: false,
      renderCell: (params) => {
        const name = params.row.username || "Customer";
        const avatar =
          params.value ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff&size=150`;
        return (
          <img
            src={avatar}
            alt={name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff&size=150`;
            }}
            className="w-9 h-9 rounded-full object-cover border border-slate-200"
          />
        );
      },
    },
    {
      field: "username",
      headerName: "Customer Name",
      width: 170,
      renderCell: (params) => (
        <span className="font-semibold text-slate-800">{params.value || "-"}</span>
      ),
    },
    { field: "email", headerName: "Email Address", width: 220 },
    { field: "phoneNumber", headerName: "Phone Number", width: 150 },
    {
      field: "adress",
      headerName: "City / Address",
      width: 180,
      renderCell: (params) => (
        <span className="text-slate-600 text-xs truncate" title={params.value}>
          {params.value || "Tamil Nadu"}
        </span>
      ),
    },
    {
      field: "totalBookings",
      headerName: "Bookings",
      width: 110,
      renderCell: (params) => (
        <span className="font-bold text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
          {params.value} Booked
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
          onClick={() => handleDeleteUser(params.row.id)}
          title="Delete Customer"
        >
          <DeleteForeverIcon fontSize="small" className="text-red-500 hover:text-red-700" />
        </Button>
      ),
    },
  ];

  const rows = users.map((u) => ({
    id: u._id,
    avatar: u.profilePicture,
    username: u.username,
    email: u.email,
    phoneNumber: u.phoneNumber || "-",
    adress: u.adress || "Tamil Nadu",
    totalBookings: u.totalBookings || 0,
  }));

  return (
    <>
      <Toaster position="top-right" />
      <div className="max-w-[1100px] p-6 md:p-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <Header title="Customer Management" />
            <p className="text-xs text-slate-500 mt-1">
              View and manage registered Tamil Nadu car rental customers ({users.length} registered)
            </p>
          </div>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon className={loading ? "animate-spin" : ""} />}
            onClick={fetchUsers}
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

export default AllUsers;
