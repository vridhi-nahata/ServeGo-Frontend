import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

function Navbar() {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedIn } =
    useContext(AppContext);
  const role = userData?.role;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      data.success && setIsLoggedIn(false);
      data.success && setUserData(false);
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 shadow-lg"
      style={{
        background:
          "linear-gradient(90deg, var(--background-light) 0%, var(--primary-light) 60%, var(--accent) 100%)",
      }}
    >
      <div className="flex justify-between items-center px-4 py-3 max-w-7xl mx-auto">
        {/* 1. Logo + Title */}
        <div className="flex items-center gap-2">
          <img
            onClick={() => navigate("/")}
            src="/icons/logo.png"
            alt="logo"
            className="w-8 cursor-pointer"
          />
          <p
            className="font-nosifer text-lg sm:text-xl hidden xs:block font-extrabold"
            style={{ color: "var(--primary)" }}
          >
            ServeGo
          </p>
        </div>

        {/* 2. Mobile Hamburger (only on small screens) */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-xl focus:outline-none"
            style={{ color: "var(--primary)" }}
          >
            <i className="fas fa-bars"></i>
          </button>
        </div>

        {/* 3. Desktop Nav + Login/User */}
        <div
          className="hidden md:flex items-center gap-6 text-md"
          style={{ color: "var(--ternary)" }}
        >
          {role === "provider" && (
            <Link
              to="/provider/provider-dashboard"
              className="hover:text-[color:var(--primary)] font-medium hover:font-extrabold focus:outline-none"
            >
              Dashboard
            </Link>
          )}
          <Link
            to="/"
            className="hover:text-[color:var(--primary)] font-medium hover:font-extrabold focus:outline-none"
          >
            Home
          </Link>
          <Link
            to="/services"
            className="hover:text-[color:var(--primary)] font-medium hover:font-extrabold focus:outline-none"
          >
            Services
          </Link>
          <Link
            to="/aboutus"
            className="hover:text-[color:var(--primary)] font-medium hover:font-extrabold focus:outline-none"
          >
            About Us
          </Link>
        </div>

        {/* 4. Login / User  */}
        <div className="flex items-center gap-3">
          {userData ? (
            <div className="relative group">
              {userData.avatarUrl ? (
                <img
                  src={userData.avatarUrl}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover cursor-pointer"
                />
              ) : (
                <div
                  className="w-8 h-8 flex justify-center items-center text-[color:var(--white)] rounded-full cursor-pointer"
                  style={{ background: "var(--primary)" }}
                >
                  {userData.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div
                className="absolute top-8.5 right-0 w-40 rounded-lg hidden group-hover:block shadow-md text-[var(--secondary)] z-10"
                style={{ background: "var(--white)" }}
              >
                <ul className="text-sm space-y-1">
                  {role === "provider" && (
                    <li>
                      <Link
                        to="/provider/provider-booking"
                        className="block px-3 py-2 hover:bg-[var(--primary-light)] rounded"
                      >
                        My Bookings
                      </Link>
                    </li>
                  )}
                  {role === "customer" && (
                    <li>
                      <Link
                        to="/my-bookings"
                        className="block px-3 py-2 hover:bg-[var(--primary-light)] rounded"
                      >
                        My Bookings
                      </Link>
                    </li>
                  )}

                  <li
                    onClick={logout}
                    className="block px-3 py-2 hover:bg-[var(--primary-light)] rounded"
                  >
                    Logout
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-3 py-1.5 outline-none transition-all rounded-lg"
              style={{
                background: "var(--primary)",
                color: "var(--white)",
              }}
            >
              <p className="hidden xs:block text-sm sm:text-md">Login</p>
              <i
                className="fas fa-right-to-bracket text-xs sm:text-sm"
                style={{ color: "var(--white)" }}
              ></i>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden px-4 py-2 space-y-2 text-sm shadow-lg"
          style={{ color: "var(--ternary)", background: "var(--white)" }}
        >
          {role === "provider" && (
            <Link
              to="/provider/provider-dashboard"
              className="font-medium block hover:text-[color:var(--primary)] hover:font-extrabold focus:outline-none"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
          )}

          <Link
            to="/"
            className="font-medium block hover:text-[color:var(--primary)] hover:font-extrabold focus:outline-none"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/services"
            className="font-medium block hover:text-[color:var(--primary)] hover:font-extrabold focus:outline-none"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Services
          </Link>
          <Link
            to="/aboutus"
            className="font-medium block hover:text-[color:var(--primary)] hover:font-extrabold focus:outline-none"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About Us
          </Link>
        </div>
      )}
    </nav>
  );
}
export default Navbar;
