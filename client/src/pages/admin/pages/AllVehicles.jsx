import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { setEditData } from "../../../redux/adminSlices/actions";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Button } from "@mui/material";
import { Header } from "../components";
import toast, { Toaster } from "react-hot-toast";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { showVehicles } from "../../../redux/user/listAllVehicleSlice";
import {
  clearAdminVehicleToast,
} from "../../../redux/adminSlices/adminDashboardSlice/StatusSlice";

function AllVehicles() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAddVehicleClicked } = useSelector((state) => state.addVehicle);
  const [allVehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { adminEditVehicleSuccess, adminAddVehicleSuccess, adminCrudError } =
    useSelector((state) => state.statusSlice);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/showVehicles", {
        method: "GET",
      });
      if (res.ok) {
        const data = await res.json();
        setVehicles(Array.isArray(data) ? data : []);
        dispatch(showVehicles(data));
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [isAddVehicleClicked]);

  // Delete a vehicle
  const handleDelete = async (vehicle_id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      setVehicles((prev) => prev.filter((cur) => cur._id !== vehicle_id));
      const res = await fetch(`/api/admin/deleteVehicle/${vehicle_id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Vehicle deleted successfully");
      } else {
        toast.error("Failed to delete vehicle");
        fetchVehicles();
      }
    } catch (error) {
      console.log(error);
      toast.error("Error deleting vehicle");
      fetchVehicles();
    }
  };

  // Edit vehicle
  const handleEditVehicle = (vehicle_id) => {
    dispatch(setEditData({ _id: vehicle_id }));
    navigate(`/adminDashboard/editProducts?vehicle_id=${vehicle_id}`);
  };

  const columns = [
    {
      field: "image",
      headerName: "Image",
      width: 120,
      renderCell: (params) => (
        <img
          src={params.value || "https://evmwheels.com/front-theme/images/Group%20316.png"}
          style={{
            width: "55px",
            height: "40px",
            borderRadius: "6px",
            objectFit: "contain",
            backgroundColor: "#f8fafc",
          }}
          alt="vehicle"
        />
      ),
    },
    {
      field: "registeration_number",
      headerName: "Registration No.",
      width: 160,
      renderCell: (params) => (
        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
          {params.value}
        </span>
      ),
    },
    { field: "company", headerName: "Brand", width: 140 },
    { field: "name", headerName: "Model Name", width: 150 },
    {
      field: "price",
      headerName: "Rate / Day",
      width: 130,
      renderCell: (params) => (
        <span className="font-bold text-slate-800">₹{params.value}</span>
      ),
    },
    { field: "district", headerName: "District", width: 140 },
    {
      field: "edit",
      headerName: "Edit",
      width: 90,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          onClick={() => handleEditVehicle(params.row.id)}
          title="Edit Vehicle"
        >
          <ModeEditOutlineIcon fontSize="small" className="text-blue-600" />
        </Button>
      ),
    },
    {
      field: "delete",
      headerName: "Delete",
      width: 90,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          onClick={() => handleDelete(params.row.id)}
          title="Delete Vehicle"
        >
          <DeleteForeverIcon fontSize="small" className="text-red-500" />
        </Button>
      ),
    },
  ];

  const rows = allVehicles
    .filter(
      (vehicle) =>
        vehicle.isDeleted !== true &&
        vehicle.isDeleted !== "true" &&
        vehicle.isAdminApproved !== false &&
        vehicle.isAdminApproved !== "false"
    )
    .map((vehicle) => ({
      id: vehicle._id,
      image: Array.isArray(vehicle.image) ? vehicle.image[0] : vehicle.image,
      registeration_number: vehicle.registeration_number || "TN-01-AB-1001",
      company: vehicle.company || "-",
      name: vehicle.name || vehicle.model || "Car",
      price: vehicle.price || 0,
      district: vehicle.district || "Chennai",
    }));

  useEffect(() => {
    if (adminEditVehicleSuccess) {
      toast.success("Vehicle updated successfully");
    } else if (adminAddVehicleSuccess) {
      toast.success("Vehicle added successfully");
    } else if (adminCrudError) {
      toast.error("Operation failed");
    }
  }, [adminEditVehicleSuccess, adminAddVehicleSuccess, adminCrudError, dispatch]);

  useEffect(() => {
    const clearNotificationsTimeout = setTimeout(() => {
      dispatch(clearAdminVehicleToast());
    }, 3000);

    return () => clearTimeout(clearNotificationsTimeout);
  }, [adminEditVehicleSuccess, adminAddVehicleSuccess, adminCrudError, dispatch]);

  return (
    <>
      <Toaster position="top-right" />

      <div className="max-w-[1100px] p-6 md:p-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <Header title="Vehicle Management" />
            <p className="text-xs text-slate-500 mt-1">
              Manage your Tamil Nadu vehicle fleet ({rows.length} active vehicles)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon className={loading ? "animate-spin" : ""} />}
              onClick={fetchVehicles}
              sx={{ textTransform: "none", borderRadius: "8px" }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => navigate("/adminDashboard/addProducts")}
              sx={{
                bgcolor: "#0f172a",
                "&:hover": { bgcolor: "#000" },
                textTransform: "none",
                fontWeight: "bold",
                borderRadius: "8px",
                px: 2,
                py: 1,
              }}
            >
              Add New Vehicle
            </Button>
          </div>
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
}

export default AllVehicles;
