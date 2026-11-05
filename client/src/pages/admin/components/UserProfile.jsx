import { useDispatch, useSelector } from "react-redux";
import { toggleNavbarPage } from "../../../redux/adminSlices/adminDashboardSlice/DashboardSlice";
import { signOut } from "../../../redux/user/userSlice";
import { useNavigate, Link } from "react-router-dom";
import { MdOutlineCancel, MdSecurity, MdLogout, MdLanguage } from "react-icons/md";
import ProfileEdit from "../../user/ProfileEdit";

const UserProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const handleSignout = async () => {
    try {
      await fetch("/api/admin/signout", {
        method: "GET",
        credentials: "include",
      });
    } catch (e) {
      console.log(e);
    }
    dispatch(signOut());
    dispatch(toggleNavbarPage("userProfile"));
    navigate("/signin");
  };

  const avatarSrc =
    currentUser?.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      currentUser?.username || "Admin"
    )}&background=3b82f6&color=fff&size=200`;

  return (
    <div className="nav-item absolute right-1 top-16 bg-white dark:bg-[#42464D] p-6 rounded-2xl w-80 shadow-2xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <p className="font-bold text-base text-slate-800 dark:text-gray-200">Admin Profile</p>
        <button
          type="button"
          onClick={() => dispatch(toggleNavbarPage("userProfile"))}
          className="text-slate-400 hover:text-slate-700 text-xl rounded-full p-1 hover:bg-slate-100 transition"
        >
          <MdOutlineCancel />
        </button>
      </div>

      <div className="flex gap-4 items-center mt-5 pb-5 border-b border-slate-100">
        <div className="relative">
          <img
            className="rounded-full h-16 w-16 object-cover border-2 border-blue-500 shadow"
            src={avatarSrc}
            alt={currentUser?.username || "Admin"}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                currentUser?.username || "Admin"
              )}&background=3b82f6&color=fff&size=200`;
            }}
          />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-900 dark:text-gray-200 text-base truncate">
            {currentUser?.username || "Administrator"}
          </p>
          <p className="text-slate-500 text-xs truncate">
            {currentUser?.email || "admin@rentaride.com"}
          </p>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full mt-1 border border-blue-200">
            <MdSecurity /> Super Admin
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition">
          <span className="text-xs font-semibold text-slate-700">Edit Admin Profile</span>
          <ProfileEdit />
        </div>

        <Link
          to="/"
          onClick={() => dispatch(toggleNavbarPage("userProfile"))}
          className="flex items-center gap-2 text-xs font-semibold text-slate-700 p-2.5 rounded-lg hover:bg-slate-50 transition"
        >
          <MdLanguage className="text-base text-slate-500" />
          <span>View Customer Site</span>
        </Link>

        <button
          type="button"
          onClick={handleSignout}
          className="w-full mt-2 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 px-4 rounded-xl text-xs transition"
        >
          <MdLogout className="text-base" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
