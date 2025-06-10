import React, { useState,useContext } from "react";
import { assets } from "../assets/assets";
import { SERVICES } from "../constants/services";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const { backendUrl, setIsLoggedIn } = useContext(AppContext);

  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [servicesOffered, setServicesOffered] = useState([]);
  const [experienceYears, setExperienceYears] = useState("");
  const [availability, setAvailability] = useState("");
  const [serviceDocs, setServiceDocs] = useState([]);

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      axios.defaults.withCredentials = true; // Enable sending cookies with requests
      if (state === "Sign Up") {
        const { data } = await axios.post(`${backendUrl}/api/auth/register`, {
          name,
          email,
          phone,
          password,
          role,
          servicesOffered,
          experienceYears,
          availability,
          serviceDocs,
        });

        if (data.success) {
          setIsLoggedIn(true);
          navigate("/");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/auth/login`, {
          email,
          password,
        });

        if (data.success) {
          setIsLoggedIn(true);
          navigate("/");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 bg-gradient-to-br from-blue-200 to-purple-400 relative">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="logo"
        className="absolute left-4 sm:left-8 top-4 w-10 sm:w-16 cursor-pointer"
      />

      <div className="bg-slate-900 w-full max-w-md p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg flex flex-col items-center gap-5 text-indigo-300 text-sm sm:text-base">
        <h2 className="text-xl xs:text-2xl md:text-3xl font-semibold text-white text-center mb-2">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </h2>
        <p className="text-center text-sm mb-2">
          {state === "Sign Up"
            ? "Create your account"
            : "Login to your account"}
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {state === "Sign Up" && (
            <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">
              <i className="fas fa-user text-white text-md"></i>
              <input
                type="text"
                placeholder="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent outline-none w-full text-white"
              />
            </div>
          )}

          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">
            <i className="fas fa-envelope text-white text-md"></i>
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent outline-none w-full text-white"
            />
          </div>

          {state === "Sign Up" && (
            <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">
              <i className="fas fa-phone text-white text-md"></i>{" "}
              <input
                type="tel"
                placeholder="Phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-transparent outline-none w-full text-white"
              />
            </div>
          )}

          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">
            <i className="fas fa-lock text-white text-md"></i>{" "}
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent outline-none w-full text-white"
            />
          </div>

          {state === "Sign Up" && (
            <div className="flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C] text-white">
              <i className="fas fa-user-tag text-white text-md"></i>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#333A5C] text-white outline-none cursor-pointer"
              >
                <option value="" disabled>
                  -- Select Role --
                </option>
                <option value="customer">Customer</option>
                <option value="provider">Provider</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          {state === "Sign Up" && role === "provider" && (
            <>
              <div className="w-full px-5 py-2.5 rounded-2xl bg-[#333A5C] text-white">
                <div className="flex items-center gap-3">
                  <i className="fas fa-clipboard-list text-white text-md mb-2"></i>
                  <label className="block text-sm mb-1">Services Offered</label>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto text-xs">
                  {SERVICES.map((service) => (
                    <label key={service} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        value={service}
                        checked={servicesOffered.includes(service)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setServicesOffered([...servicesOffered, service]);
                          } else {
                            setServicesOffered(
                              servicesOffered.filter((s) => s !== service)
                            );
                          }
                        }}
                        className="accent-green-400 bg-white"
                      />
                      {service}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">
                <i className="fas fa-business-time text-white text-md"></i>
                <input
                  type="number"
                  placeholder="Years of Experience"
                  min="0"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="bg-transparent outline-none text-white w-full"
                />
              </div>

              <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">
                <i className="fas fa-calendar-check text-white text-md"></i>
                <input
                  type="text"
                  placeholder="Availability (e.g. Mon–Fri, 9am–6pm)"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="bg-transparent outline-none text-white w-full"
                />
              </div>

              <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C] text-white">
                <i className="fas fa-file-upload text-white text-md"></i>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setServiceDocs(Array.from(e.target.files))}
                  className="bg-transparent outline-none text-sm w-full file:text-white file:bg-indigo-400 file:px-2 file:py-1 file:rounded-full file:border-0 file:cursor-pointer file:hover:bg-indigo-600 file:transition-all file:duration-200"
                />
              </div>
            </>
          )}

          {state === "Login" && (
            <p
              onClick={() => navigate("/reset-password")}
              className="text-indigo-400 text-right text-sm cursor-pointer"
            >
              Forgot Password?
            </p>
          )}

          <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium mt-2">
            {state}
          </button>
        </form>

        <p className="text-gray-400 text-center text-sm mt-2">
          {state === "Sign Up" ? (
            <>
              Already have an account?{" "}
              <span
                onClick={() => setState("Login")}
                className="text-blue-400 cursor-pointer underline"
              >
                Login
              </span>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <span
                onClick={() => setState("Sign Up")}
                className="text-blue-400 cursor-pointer underline"
              >
                Sign Up
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default Login;
