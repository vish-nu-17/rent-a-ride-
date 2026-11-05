import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FaCarSide, FaStar, FaGasPump } from "react-icons/fa";
import { MdAirlineSeatReclineNormal } from "react-icons/md";
import { onVehicleDetail } from "./Vehicles";

const Favorites = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch("/api/user/listAllVehicles");
        if (res.ok) {
          const data = await res.json();
          // Pick top recommended vehicles
          setVehicles(Array.isArray(data) ? data.slice(0, 6) : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Recommended & Saved Rides</h1>
          <p className="text-xs text-slate-500 mt-1">
            Top rated self-drive vehicles available across Tamil Nadu hubs
          </p>
        </div>
        <Link
          to="/vehicles"
          className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition"
        >
          Explore All Vehicles →
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-slate-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <FaCarSide className="mx-auto text-4xl text-slate-300 mb-2" />
          <p className="text-sm font-bold text-slate-700">No Vehicles Found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {vehicles.map((v) => (
            <div
              key={v._id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="flex gap-4 items-center">
                <img
                  src={Array.isArray(v.image) ? v.image[0] : v.image}
                  alt={v.name}
                  className="w-28 h-20 object-contain bg-slate-50 rounded-lg p-1 border border-slate-100 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">
                      {v.district || "Tamil Nadu"}
                    </span>
                    <span className="flex items-center gap-0.5 text-xs text-amber-500 font-bold">
                      <FaStar /> 4.9
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-1 truncate capitalize">
                    {v.name} ({v.model})
                  </h3>
                  <p className="text-xs text-slate-500 truncate">{v.company}</p>
                  <p className="text-sm font-black text-slate-900 mt-1">
                    ₹{v.price} <span className="text-[10px] font-normal text-slate-400">/ day</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-600">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <MdAirlineSeatReclineNormal /> {v.seats || 5}
                  </span>
                  <span className="flex items-center gap-1 capitalize">
                    <FaGasPump /> {v.fuel_type || "Petrol"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onVehicleDetail(v._id, dispatch, navigate)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white font-bold rounded-lg text-xs transition"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
