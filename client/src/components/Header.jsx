import styles from "../index";
import { navLinks } from "../constants";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RxHamburgerMenu } from "react-icons/rx";
import { MdMenuOpen } from "react-icons/md";
import { useState } from "react";
import { Drawer } from "antd";


function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [nav, setNav] = useState(false);

  return (
    <div
      className={`w-full   flex justify-between items-center px-6 sm:px-12 md:px-18 lg:py-6 lg:px-28 pt-10 mt-5 md:mt-10 sm:max-w-[900px] lg:max-w-[1500px] mx-auto `}
    >
      <Link to="/">
        <div
          className={` text-[16px] md:text-[18px] lg:text-[20px] font-poppins font-bold`}
        >
          Rent a Ride
        </div>
      </Link>

      <div className="hidden lg:block">
        <ul className="flex list-none">
          {navLinks.map((navlink, index) => (
            <li
              key={index}
              className={`${index != navLinks.length - 1 ? "mx-4" : "mx-0"}`}
            >
              <Link
                to={navlink.path}
                className={`text-black  font-poppins cursor-pointer font-semibold`}
              >
                {navlink.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex gap-2">
        <div className="hidden md:inline-flex">
          {!currentUser && (
            <Link to={"/signIn"}>
              <button
                id="signin"
                className={`border-[1px] hidden lg:inline-flex border-green-500 py-1 text-[12px] md:text-[14px] sm:py-[7px] px-2 sm:px-4 font-normal sm:font-semibold rounded-md `}
              >
                Sign In
              </button>
            </Link>
          )}
        </div>
        <div className="hidden lg:flex items-center justify-center">
          {currentUser ? (
            <Link
              to={
                currentUser.isAdmin
                  ? "/adminDashboard/adminHome"
                  : currentUser.isVendor
                  ? "/vendorDashboard"
                  : "/profile"
              }
              className="flex items-center gap-2 group"
              title={`Logged in as ${currentUser.username || "User"}`}
            >
              <img
                src={
                  currentUser.profilePicture ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    currentUser.username || "User"
                  )}&background=0ea5e9&color=fff&size=200`
                }
                alt={currentUser.username || "Profile"}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    currentUser.username || "User"
                  )}&background=0ea5e9&color=fff&size=200`;
                }}
                className="h-10 w-10 rounded-full object-cover border-2 border-emerald-500 shadow-sm group-hover:scale-105 transition"
              />
              <span className="text-sm font-semibold text-slate-700 max-w-[120px] truncate">
                {currentUser.username}
              </span>
            </Link>
          ) : (
            <div className="hidden lg:inline-flex">
              <Link to={"/signup"}>
                <button id="signup" className={`${styles.button} `}>
                  Sign Up
                </button>
              </Link>
            </div>
          )}
        </div>


        {/*  Mobile Menu */}
        <div className="relative lg:hidden flex justify-center items-center">
          <button onClick={() => setNav(!nav)}>
            <div>{nav ? <MdMenuOpen /> : <RxHamburgerMenu />}</div>
          </button>
          <Drawer
            destroyOnClose={true}
            onClose={() => setNav(false)}
            open={nav}
          >
            <div className="flex flex-col items-start justify-between gap-y-10">
              {navLinks.map((navlink, index) => (
            
                  <Link
                    key={index}
                    to={navlink.path}
                    className="text-[26px]"
                    onClick={() => setNav(false)}
                  >
                    {navlink.title}
                  </Link>
              
              ))}

              {currentUser ? (
                <div className="pt-2 border-t border-slate-100 w-full">
                  <Link
                    to={
                      currentUser.isAdmin
                        ? "/adminDashboard/adminHome"
                        : currentUser.isVendor
                        ? "/vendorDashboard"
                        : "/profile"
                    }
                    className="flex items-center gap-3 py-2"
                    onClick={() => setNav(false)}
                  >
                    <img
                      src={
                        currentUser.profilePicture ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          currentUser.username || "User"
                        )}&background=0ea5e9&color=fff&size=200`
                      }
                      alt={currentUser.username || "Profile"}
                      className="h-10 w-10 rounded-full object-cover border-2 border-emerald-500"
                    />
                    <div>
                      <p className="font-bold text-slate-800 text-lg leading-tight">
                        {currentUser.username}
                      </p>
                      <p className="text-xs text-slate-500">
                        {currentUser.isAdmin ? "Administrator" : currentUser.isVendor ? "Vendor" : "Customer"}
                      </p>
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4 w-full pt-2">
                  <Link to={"/signIn"} onClick={() => setNav(false)}>
                    <button
                      id="signin"
                      className="w-full text-left rounded-md text-[20px] font-semibold text-emerald-600"
                    >
                      Sign In
                    </button>
                  </Link>
                  <Link to={"/signup"} onClick={() => setNav(false)}>
                    <button
                      id="signup"
                      className="w-full text-left rounded-md text-[20px] font-semibold text-slate-800"
                    >
                      Sign Up
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </Drawer>
          {nav && (
            <div>
              <div className="absolute top-6 z-10 right-0  ">
                <Link to={"/signIn"}>
                  {currentUser &&
                  !currentUser.isAdmin &&
                  !currentUser.isVendor ? (
                    ""
                  ) : (
                    <button
                      id="signin"
                      className={`border-[1px] w-[80px]  border-green-500 bg-green-500  py-1 text-[10px]   px-2  font-normal sm:font-semibold  `}
                    >
                      Sign In
                    </button>
                  )}
                </Link>
              </div>

              <div>
                {currentUser &&
                  !currentUser.isAdmin &&
                  !currentUser.isVendor && (
                    <div className="hidden lg:inline-flex">
                      <Link to={"/signup"}>
                        <button id="signup" className={`${styles.button} `}>
                          Sign Up
                        </button>
                      </Link>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
