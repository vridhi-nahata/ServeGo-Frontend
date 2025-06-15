import React, { useContext,useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate,Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

function Navbar() {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedIn } =
    useContext(AppContext);
      const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + '/api/auth/send-verify-otp');
      if (data.success) {
        navigate('email-verify')
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  const logout= async () => {
    try{
      axios.defaults.withCredentials= true;
      const {data} = await axios.post(backendUrl + '/api/auth/logout');
      data.success && setIsLoggedIn(false);
      data.success && setUserData(false);
      navigate("/");
      toast.success(data.message);
    }
    catch(error){
      toast.error(error.message);
    }
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-blue-200 to-purple-300 shadow-lg">
      <div className="flex justify-between items-center px-4 py-3 max-w-7xl mx-auto">
        {/* 1. Logo + Title */}
        <div className="flex items-center gap-2">
          <img
            onClick={() => navigate("/")}
            src={assets.logo}
            alt="logo"
            className="w-8 cursor-pointer"
          />
          <p className="font-nosifer text-blue-800 text-lg sm:text-xl hidden xs:block">
            ServeGo
          </p>
        </div>

        {/* 2. Mobile Hamburger (only on small screens) */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-indigo-800 text-xl focus:outline-none"
          >
            <i className="fas fa-bars"></i>
          </button>
        </div>

        {/* 3. Desktop Nav + Login/User */}
        <div className="hidden md:flex items-center gap-6 text-md text-indigo-600">
          <Link to="/" className="hover:text-indigo-800 hover:font-semibold focus:outline-none">Home</Link>
          <Link to="/services" className="hover:text-indigo-800 hover:font-semibold focus:outline-none">Services</Link>
          <Link to="/aboutus" className="hover:text-indigo-800 hover:font-semibold focus:outline-none">About Us</Link>
        </div>

        {/* 4. Login / User  */}
        <div className="flex items-center gap-3">
          {userData ? (
            <div className="relative group">
              <div className="w-8 h-8 flex justify-center items-center text-white bg-indigo-900 rounded-full cursor-pointer">
                {userData.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute top-8.5 right-0 w-40 rounded-lg p-2 hidden group-hover:block bg-white shadow-md text-black z-10">
                <ul className="text-sm space-y-1">
                  {!userData.isAccountVerified && (
                    <li
                      onClick={sendVerificationOtp}
                      className="px-3 py-1 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      Verify email
                    </li>
                  )}
                  <li
                    onClick={logout}
                    className="px-2 py-1 hover:bg-gray-200 cursor-pointer"
                  >
                    Logout
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-3 py-1.5 outline-none hover:bg-blue-900 transition-all rounded-lg bg-blue-800 text-white"
            >
              <p className="hidden xs:block text-sm sm:text-md">Login</p>
              <i className="fas fa-right-to-bracket text-white text-xs sm:text-sm"></i>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 py-2 space-y-2 text-sm text-indigo-600 bg-white shadow-lg">
          <Link to="/" className="block hover:text-indigo-800 hover:font-semibold focus:outline-none" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link to="/services" className="block hover:text-indigo-800 hover:font-semibold focus:outline-none" onClick={() => setIsMobileMenuOpen(false)}>Services</Link>
          <Link to="/aboutus" className="block hover:text-indigo-800 hover:font-semibold focus:outline-none" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
        </div>
      )}
    </nav>
  );
}
export default Navbar;
