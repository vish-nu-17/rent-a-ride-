import Button from "@mui/material/Button";
import { MenuItem } from "@mui/material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Controller, useForm } from "react-hook-form";
import { IoMdClose } from "react-icons/io";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useDispatch, useSelector } from "react-redux";
import { setEditData } from "../../../redux/adminSlices/actions";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { setadminEditVehicleSuccess } from "../../../redux/adminSlices/adminDashboardSlice/StatusSlice";
import { useEffect, useState } from "react";
import { fetchModelData } from "./AddProductModal";

export default function EditProductComponent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, handleSubmit, control, reset } = useForm();
  const { userAllVehicles } = useSelector((state) => state.userListVehicles);
  const { modelData, companyData, locationData, districtData } = useSelector(
    (state) => state.modelDataSlice
  );

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const vehicle_id = queryParams.get("vehicle_id");

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load master data (models, companies, locations, districts)
  useEffect(() => {
    fetchModelData(dispatch);
  }, [dispatch]);

  // Load vehicle data either from Redux or via API
  useEffect(() => {
    const found = userAllVehicles?.find((cur) => cur._id === vehicle_id);
    if (found) {
      setVehicle(found);
      setLoading(false);
    } else if (vehicle_id) {
      const fetchOne = async () => {
        try {
          const res = await fetch("/api/admin/showVehicles");
          if (res.ok) {
            const data = await res.json();
            const target = data.find((v) => v._id === vehicle_id);
            if (target) {
              setVehicle(target);
            }
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchOne();
    }
  }, [vehicle_id, userAllVehicles]);

  const onEditSubmit = async (editData) => {
    let tostID;
    try {
      if (editData && vehicle_id) {
        tostID = toast.loading("Saving changes...", { position: "bottom-center" });

        const formData = {
          ...editData,
          insurance_end_date: editData.insurance_end_date?.$d || editData.insurance_end_date || vehicle?.insurance_end,
          Registeration_end_date: editData.Registeration_end_date?.$d || editData.Registeration_end_date || vehicle?.registeration_end,
          polution_end_date: editData.polution_end_date?.$d || editData.polution_end_date || vehicle?.pollution_end,
        };

        dispatch(setEditData({ _id: vehicle_id, ...formData }));
        const res = await fetch(`/api/admin/editVehicle/${vehicle_id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ formData }),
        });

        toast.dismiss(tostID);

        if (!res.ok) {
          toast.error("Failed to update vehicle");
        } else {
          toast.success("Vehicle updated successfully!");
          dispatch(setadminEditVehicleSuccess(true));
          setTimeout(() => {
            navigate("/adminDashboard/allProduct");
          }, 500);
        }

        dispatch(setEditData(null));
      }
      reset();
    } catch (error) {
      console.log(error);
      if (tostID) toast.dismiss(tostID);
      toast.error("Error updating vehicle");
    }
  };

  const handleClose = () => {
    navigate("/adminDashboard/allProduct");
    dispatch(setEditData(null));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-3"></div>
        <p className="text-sm text-slate-600 font-medium">Loading vehicle details...</p>
      </div>
    );
  }

  const insuranceDefaultDate = vehicle?.insurance_end
    ? dayjs(new Date(vehicle.insurance_end))
    : null;
  const registerationDefaultDate = vehicle?.registeration_end
    ? dayjs(new Date(vehicle.registeration_end))
    : null;
  const pollutionDefaultDate = vehicle?.pollution_end
    ? dayjs(new Date(vehicle.pollution_end))
    : null;

  return (
    <div className="py-6 px-4">
      <div className="max-w-[1000px] mx-auto flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">
          Edit Vehicle — {vehicle?.name || "Details"}
        </h2>
        <button
          onClick={handleClose}
          className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          title="Close"
        >
          <IoMdClose className="text-2xl" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onEditSubmit)}>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 max-w-[1000px] mx-auto p-6 md:p-8">
          <Box
            sx={{
              "& .MuiTextField-root": {
                m: 2,
                width: "28ch",
                "@media (max-width: 640px)": {
                  width: "100%",
                  m: 1,
                },
              },
            }}
            noValidate
            autoComplete="off"
          >
            <div>
              <TextField
                required
                id="registeration_number"
                label="Registration Number"
                {...register("registeration_number")}
                defaultValue={vehicle?.registeration_number || ""}
              />

              <Controller
                control={control}
                name="company"
                defaultValue={vehicle?.company || ""}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required
                    id="company"
                    select
                    label="Brand / Company"
                  >
                    {companyData.length > 0 ? (
                      companyData.map((cur, idx) => (
                        <MenuItem value={cur} key={idx}>
                          {cur}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value={vehicle?.company || "Toyota"}>
                        {vehicle?.company || "Toyota"}
                      </MenuItem>
                    )}
                  </TextField>
                )}
              />

              <TextField
                required
                id="name"
                label="Model Name"
                {...register("name")}
                defaultValue={vehicle?.name || ""}
              />

              <Controller
                control={control}
                name="model"
                defaultValue={vehicle?.model || ""}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required
                    id="model"
                    select
                    label="Car Model"
                  >
                    {modelData.length > 0 ? (
                      modelData.map((cur, idx) => (
                        <MenuItem value={cur} key={idx}>
                          {cur}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value={vehicle?.model || "Innova"}>
                        {vehicle?.model || "Innova"}
                      </MenuItem>
                    )}
                  </TextField>
                )}
              />

              <TextField
                id="title"
                label="Listing Title"
                {...register("title")}
                defaultValue={vehicle?.car_title || ""}
              />

              <TextField
                id="base_package"
                label="Base Package (kms)"
                {...register("base_package")}
                defaultValue={vehicle?.base_package || "Unlimited"}
              />

              <TextField
                id="price"
                type="number"
                label="Price per Day (₹)"
                {...register("price")}
                defaultValue={vehicle?.price || ""}
              />

              <TextField
                required
                id="year_made"
                type="number"
                label="Manufacturing Year"
                {...register("year_made")}
                defaultValue={vehicle?.year_made || ""}
              />

              <Controller
                control={control}
                name="fuelType"
                defaultValue={vehicle?.fuel_type || "petrol"}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required
                    id="fuel_type"
                    select
                    label="Fuel Type"
                  >
                    <MenuItem value={"petrol"}>Petrol</MenuItem>
                    <MenuItem value={"diesel"}>Diesel</MenuItem>
                    <MenuItem value={"electric"}>Electric</MenuItem>
                    <MenuItem value={"hybrid"}>Hybrid</MenuItem>
                  </TextField>
                )}
              />
            </div>

            <div>
              <Controller
                name="carType"
                control={control}
                defaultValue={vehicle?.car_type || "sedan"}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required
                    id="car_type"
                    select
                    label="Car Segment"
                  >
                    <MenuItem value="sedan">Sedan</MenuItem>
                    <MenuItem value="suv">SUV</MenuItem>
                    <MenuItem value="hatchback">Hatchback</MenuItem>
                  </TextField>
                )}
              />

              <Controller
                control={control}
                name="Seats"
                defaultValue={vehicle?.seats || 5}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required
                    id="seats"
                    select
                    label="Seats"
                  >
                    <MenuItem value={5}>5 Seater</MenuItem>
                    <MenuItem value={7}>7 Seater</MenuItem>
                    <MenuItem value={8}>8 Seater</MenuItem>
                  </TextField>
                )}
              />

              <Controller
                control={control}
                name="transmitionType"
                defaultValue={vehicle?.transmition || "manual"}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required
                    id="transmittion_type"
                    select
                    label="Transmission"
                  >
                    <MenuItem value={"automatic"}>Automatic</MenuItem>
                    <MenuItem value={"manual"}>Manual</MenuItem>
                  </TextField>
                )}
              />

              <Controller
                control={control}
                name="vehicleDistrict"
                defaultValue={vehicle?.district || "Chennai"}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required
                    id="vehicleDistrict"
                    select
                    label="Tamil Nadu District"
                  >
                    {districtData.length > 0 ? (
                      districtData.map((cur, idx) => (
                        <MenuItem value={cur} key={idx}>
                          {cur}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value={vehicle?.district || "Chennai"}>
                        {vehicle?.district || "Chennai"}
                      </MenuItem>
                    )}
                  </TextField>
                )}
              />

              <Controller
                control={control}
                name="vehicleLocation"
                defaultValue={vehicle?.location || "Chennai Airport"}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required
                    id="vehicleLocation"
                    select
                    label="Pickup Hub"
                  >
                    {locationData.length > 0 ? (
                      locationData.map((cur, idx) => (
                        <MenuItem value={cur} key={idx}>
                          {cur}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value={vehicle?.location || "Chennai Airport"}>
                        {vehicle?.location || "Chennai Airport"}
                      </MenuItem>
                    )}
                  </TextField>
                )}
              />

              <TextField
                id="description"
                label="Vehicle Description"
                defaultValue={vehicle?.car_description || ""}
                multiline
                rows={3}
                sx={{
                  width: "100%",
                  "@media (min-width: 1024px)": {
                    width: "90% !important",
                  },
                }}
                {...register("description")}
              />
            </div>

            <div>
              <Controller
                name="insurance_end_date"
                control={control}
                defaultValue={insuranceDefaultDate}
                render={({ field }) => (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      {...field}
                      label="Insurance Expiry Date"
                      value={field.value || null}
                      onChange={(date) => field.onChange(date)}
                    />
                  </LocalizationProvider>
                )}
              />

              <Controller
                control={control}
                name="Registeration_end_date"
                defaultValue={registerationDefaultDate}
                render={({ field }) => (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      {...field}
                      label="Registration Expiry Date"
                      value={field.value || null}
                      onChange={(date) => field.onChange(date)}
                    />
                  </LocalizationProvider>
                )}
              />

              <Controller
                control={control}
                name="polution_end_date"
                defaultValue={pollutionDefaultDate}
                render={({ field }) => (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      {...field}
                      label="Pollution Expiry Date"
                      value={field.value || null}
                      onChange={(date) => field.onChange(date)}
                    />
                  </LocalizationProvider>
                )}
              />
            </div>

            <div className="mt-8 flex justify-end gap-3 px-2">
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleClose}
                sx={{ textTransform: "none", borderRadius: "8px" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                type="submit"
                sx={{
                  bgcolor: "#0f172a",
                  "&:hover": { bgcolor: "#000" },
                  textTransform: "none",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  px: 4,
                }}
              >
                Save Changes
              </Button>
            </div>
          </Box>
        </div>
      </form>
    </div>
  );
}
