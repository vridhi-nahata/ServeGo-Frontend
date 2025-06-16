// import React, { useState, useContext } from "react";
// import { SERVICES } from "../constants/services";
// import { useNavigate } from "react-router-dom";
// import { AppContext } from "../context/AppContext";
// import { toast } from "react-toastify";
// import axios from "axios";

// function Login() {
//   const navigate = useNavigate();
//   const { backendUrl, setIsLoggedIn, setUserData } = useContext(AppContext);

//   const [state, setState] = useState("Login"); // "Login" or "Sign Up"
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("");
//   const [servicesOffered, setServicesOffered] = useState([]);
//   const [experienceYears, setExperienceYears] = useState("");
//   const [availability, setAvailability] = useState("");
//   const [serviceDocs, setServiceDocs] = useState([]);

//   // Upload multiple files to Cloudinary
//   const uploadFilesToCloudinary = async (files) => {
//     const urls = [];

//     for (const file of files) {
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("upload_preset", "unsigned_present");
//       formData.append("cloud_name", "dznigwrbk");

//       const response = await axios.post(
//         "https://api.cloudinary.com/v1_1/dznigwrbk/auto/upload",
//         formData,
//         {
//           withCredentials: false, // Fixes the CORS error
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       urls.push(response.data.secure_url); // Save Cloudinary URL
//     }

//     return urls;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (state === "Sign Up") {
//         let uploadedDocUrls = [];
//         // Only upload if provider & files are selected
//         if (role === "provider" && serviceDocs.length > 0) {
//           uploadedDocUrls = await uploadFilesToCloudinary(serviceDocs);
//         }

//         // Send registration data, get OTP
//         const { data } = await axios.post(
//           `${backendUrl}/api/auth/send-verify-otp`,
//           {
//             name,
//             email,
//             phone,
//             password,
//             role,
//             ...(role === "provider" && {
//               servicesOffered,
//               experienceYears,
//               availability,
//               serviceDocs: uploadedDocUrls, // Use uploaded URLs
//             }),
//           },
//           { withCredentials: true }
//         );

//         if (data.success) {
//           toast.success("OTP sent to your email. Please verify.");
//           setIsLoggedIn(true);
//           // Temporarily store user data in localStorage to use during OTP verification
//           localStorage.setItem(
//             "tempUserData",
//             JSON.stringify({
//               name,
//               email,
//               phone,
//               password,
//               role,
//               servicesOffered,
//               experienceYears,
//               availability,
//               serviceDocs,
//             })
//           );
//           navigate("/email-verify"); // redirect to EmailVerify.jsx
//         } else {
//           toast.error(data.message);
//         }
//       } else {
//         // Login flow
//         const { data } = await axios.post(
//           `${backendUrl}/api/auth/login`,
//           {
//             email,
//             password,
//           },
//           { withCredentials: true }
//         );

//         if (data.success) {
//           setIsLoggedIn(true);
//           // Fetch user data after login
//           const userRes = await axios.get(`${backendUrl}/api/user/data`);
//           if (userRes.data.success) {
//             setUserData(userRes.data.userData);
//           }
//           toast.success(data.message);
//           navigate("/");
//         } else {
//           toast.error(data.message);
//         }
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 bg-gradient-to-tl from-blue-100 to-purple-200 relative">
//       <div className="bg-slate-900 w-full max-w-md p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg flex flex-col items-center gap-5 text-indigo-300 text-sm sm:text-base mt-8">
//         <h2 className="text-xl xs:text-2xl md:text-3xl font-semibold text-white text-center mb-2">
//           {state === "Sign Up" ? "Create Account" : "Login"}
//         </h2>
//         <p className="text-center text-sm mb-2">
//           {state === "Sign Up"
//             ? "Create your account"
//             : "Login to your account"}
//         </p>

//         <form onSubmit={handleSubmit} className="w-full space-y-4">
//           {/* <div className="relative w-full">
//   <input
//     type="text"
//     id="fullName"
//     value={name}
//     onChange={(e) => setName(e.target.value)}
//     placeholder=" "
//     className="peer w-full px-4 pt-5 pb-2 text-sm text-white bg-[#333A5C] rounded-full outline-none focus:ring-2 focus:ring-blue-700"
//   />
//   <label
//     htmlFor="fullName"
//     className="absolute left-4 top-2 text-sm text-white transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-white"
//   >
//     Full Name <span className="text-red-500">*</span>
//   </label>
// </div>
//  */}

//           {state === "Sign Up" && (
//             <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C] focus:outline-none focus-within:ring-2 focus-within:ring-blue-700">
//               <i className="fas fa-user text-white text-md"></i>
//               <input
//                 type="text"
//                 placeholder="Full Name"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 className="bg-transparent outline-none w-full text-white"
//               />
//             </div>
//           )}

//           <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C] focus:outline-none focus-within:ring-2 focus-within:ring-blue-700">
//             <i className="fas fa-envelope text-white text-md"></i>
//             <input
//               type="email"
//               placeholder="Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="bg-transparent outline-none w-full text-white"
//             />
//           </div>

//           {state === "Sign Up" && (
//             <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C] focus:outline-none focus-within:ring-2 focus-within:ring-blue-700">
//               <i className="fas fa-phone text-white text-md"></i>{" "}
//               <input
//                 type="tel"
//                 placeholder="Phone"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 className="bg-transparent outline-none w-full text-white"
//               />
//             </div>
//           )}

//           <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C] focus:outline-none focus-within:ring-2 focus-within:ring-blue-700">
//             <i className="fas fa-lock text-white text-md"></i>{" "}
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="bg-transparent outline-none w-full text-white"
//             />
//           </div>

//           {state === "Sign Up" && (
//             <div className="flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C] text-white focus:outline-none focus-within:ring-2 focus-within:ring-blue-700">
//               <i className="fas fa-user-tag text-white text-md"></i>
//               <select
//                 value={role}
//                 onChange={(e) => setRole(e.target.value)}
//                 className="w-full bg-[#333A5C] text-white outline-none cursor-pointer"
//               >
//                 <option value="" disabled>
//                   -- Select Role --
//                 </option>
//                 <option value="customer">Customer</option>
//                 <option value="provider">Provider</option>
//                 <option value="admin">Admin</option>
//               </select>
//             </div>
//           )}

//           {state === "Sign Up" && role === "provider" && (
//             <>
//               <div className="w-full px-5 py-2.5 rounded-2xl bg-[#333A5C] text-white">
//                 <div className="flex items-center gap-3">
//                   <i className="fas fa-clipboard-list text-white text-md mb-2"></i>
//                   <label className="block text-sm mb-1">Services Offered</label>
//                 </div>

//                 <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto text-xs">
//                   {SERVICES.map((service) => (
//                     <label key={service} className="flex items-center gap-1">
//                       <input
//                         type="checkbox"
//                         value={service}
//                         checked={servicesOffered.includes(service)}
//                         onChange={(e) => {
//                           if (e.target.checked) {
//                             setServicesOffered([...servicesOffered, service]);
//                           } else {
//                             setServicesOffered(
//                               servicesOffered.filter((s) => s !== service)
//                             );
//                           }
//                         }}
//                         className="accent-green-400 cursor-pointer"
//                       />
//                       {service}
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C] focus:outline-none focus-within:ring-2 focus-within:ring-blue-700">
//                 <i className="fas fa-business-time text-white text-md"></i>
//                 <input
//                   type="number"
//                   placeholder="Years of Experience"
//                   min="0"
//                   value={experienceYears}
//                   onChange={(e) => setExperienceYears(e.target.value)}
//                   className="bg-transparent outline-none text-white w-full"
//                 />
//               </div>

//               <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C] focus:outline-none focus-within:ring-2 focus-within:ring-blue-700">
//                 <i className="fas fa-calendar-check text-white text-md"></i>
//                 <input
//                   type="text"
//                   placeholder="Availability (e.g. Mon–Fri, 9am–6pm)"
//                   value={availability}
//                   onChange={(e) => setAvailability(e.target.value)}
//                   className="bg-transparent outline-none text-white w-full"
//                 />
//               </div>

//               <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C] text-white focus:outline-none focus-within:ring-2 focus-within:ring-blue-700">
//                 <i className="fas fa-file-upload text-white text-md"></i>
//                 <input
//                   type="file"
//                   multiple
//                   onChange={(e) => setServiceDocs(Array.from(e.target.files))}
//                   className="bg-transparent outline-none text-sm w-full file:text-white file:bg-indigo-400 file:px-2 file:py-1 file:rounded-full file:border-0 file:cursor-pointer file:hover:bg-indigo-600 file:transition-all file:duration-200"
//                 />
//               </div>
//             </>
//           )}

//           {state === "Login" && (
//             <p
//               onClick={() => navigate("/reset-password")}
//               className="text-indigo-400 text-right text-sm cursor-pointer"
//             >
//               Forgot Password?
//             </p>
//           )}

//           <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium mt-2">
//             {state}
//           </button>
//         </form>

//         <p className="text-gray-400 text-center text-sm mt-2">
//           {state === "Sign Up" ? (
//             <>
//               Already have an account?{" "}
//               <span
//                 onClick={() => setState("Login")}
//                 className="text-blue-400 cursor-pointer underline"
//               >
//                 Login
//               </span>
//             </>
//           ) : (
//             <>
//               Don't have an account?{" "}
//               <span
//                 onClick={() => setState("Sign Up")}
//                 className="text-blue-400 cursor-pointer underline"
//               >
//                 Sign Up
//               </span>
//             </>
//           )}
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;


import React, { useState, useContext } from "react";
import { SERVICES } from "../constants/services";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedIn, setUserData } = useContext(AppContext);

  const [state, setState] = useState("Login"); // "Login" or "Sign Up"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [servicesOffered, setServicesOffered] = useState([]);
  const [experienceYears, setExperienceYears] = useState("");
  const [availability, setAvailability] = useState("");
  const [serviceDocs, setServiceDocs] = useState([]);

  // Upload multiple files to Cloudinary
  const uploadFilesToCloudinary = async (files) => {
    const urls = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "unsigned_present");
      formData.append("cloud_name", "dznigwrbk");

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dznigwrbk/auto/upload",
        formData,
        {
          withCredentials: false, // Fixes the CORS error
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      urls.push(response.data.secure_url); // Save Cloudinary URL
    }

    return urls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (state === "Sign Up") {
        let uploadedDocUrls = [];
        // Only upload if provider & files are selected
        if (role === "provider" && serviceDocs.length > 0) {
          uploadedDocUrls = await uploadFilesToCloudinary(serviceDocs);
        }

        // Send registration data, get OTP
        const { data } = await axios.post(
          `${backendUrl}/api/auth/send-verify-otp`,
          {
            name,
            email,
            phone,
            password,
            role,
            ...(role === "provider" && {
              servicesOffered,
              experienceYears,
              availability,
              serviceDocs: uploadedDocUrls, // Use uploaded URLs
            }),
          },
          { withCredentials: true }
        );

        if (data.success) {
          toast.success("OTP sent to your email. Please verify.");
          setIsLoggedIn(true);
          // Temporarily store user data in localStorage to use during OTP verification
          localStorage.setItem(
            "tempUserData",
            JSON.stringify({
              name,
              email,
              phone,
              password,
              role,
              servicesOffered,
              experienceYears,
              availability,
              serviceDocs,
            })
          );
          navigate("/email-verify"); // redirect to EmailVerify.jsx
        } else {
          toast.error(data.message);
        }
      } else {
        // Login flow
        const { data } = await axios.post(
          `${backendUrl}/api/auth/login`,
          {
            email,
            password,
          },
          { withCredentials: true }
        );

        if (data.success) {
          setIsLoggedIn(true);
          // Fetch user data after login
          const userRes = await axios.get(`${backendUrl}/api/user/data`);
          if (userRes.data.success) {
            setUserData(userRes.data.userData);
          }
          toast.success(data.message);
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
    <div
      className="flex items-center justify-center min-h-screen px-4 sm:px-6 relative"
      style={{
        background:
          "linear-gradient(135deg, var(--background-light) 0%, var(--primary-light) 60%, var(--accent) 100%)",
      }}
    >
      <div
        className="w-full max-w-md p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg flex flex-col items-center gap-5 text-sm sm:text-base mt-8"
        style={{
          background: "var(--primary)",
          color: "var(--accent)",
        }}
      >
        <h2
          className="text-xl xs:text-2xl md:text-3xl font-semibold text-center pb-1"
          style={{ color: "var(--white)" }}
        >
          {state === "Sign Up" ? "Create Account" : "Login"}
        </h2>
        <p className="text-center text-sm mb-2" style={{ color: "var(--primary-light)" }}>
          {state === "Sign Up"
            ? "Create your account"
            : "Login to your account"}
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {state === "Sign Up" && (
            <div
              className="flex items-center gap-3 px-5 py-2.5 rounded-full focus:outline-none focus-within:ring-2"
              style={{
                background: "var(--ternary)",
              }}
            >
              <i className="fas fa-user text-md" style={{color:"var(--white)"}}></i>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent outline-none w-full"
                style={{ color: "var(--white)" }}
              />
            </div>
          )}

          <div
            className="flex items-center gap-3 px-5 py-2.5 rounded-full focus:outline-none focus-within:ring-2"
            style={{
              background: "var(--ternary)",
            }}
          >
            <i className="fas fa-envelope text-md" style={{color:"var(--white)"}}></i>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent outline-none w-full"
              style={{ color: "var(--white)" }}
            />
          </div>

          {state === "Sign Up" && (
            <div
              className="flex items-center gap-3 px-5 py-2.5 rounded-full focus:outline-none focus-within:ring-2"
              style={{
                background: "var(--ternary)",
              }}
            >
              <i className="fas fa-phone text-md" style={{color:"var(--white)"}}></i>
              <input
                type="tel"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-transparent outline-none w-full"
                style={{ color: "var(--white)" }}
              />
            </div>
          )}

          <div
            className="flex items-center gap-3 px-5 py-2.5 rounded-full focus:outline-none focus-within:ring-2"
            style={{
              background: "var(--ternary)",
            }}
          >
            <i className="fas fa-lock text-md" style={{color:"var(--white)"}}></i>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent outline-none w-full"
              style={{ color: "var(--white)" }}
            />
          </div>

          {state === "Sign Up" && (
            <div
              className="flex items-center gap-3 w-full px-5 py-2.5 rounded-full focus:outline-none focus-within:ring-2"
              style={{
                background: "var(--ternary)",
                color:"var(--white)"
              }}
            >
              <i className="fas fa-user-tag text-md" style={{color:"var(--white)"}}></i>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-transparent outline-none cursor-pointer"
                style={{ color: "var(--white)",background:"var(--ternary)" }}
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
              <div
                className="w-full px-5 py-2.5 rounded-2xl"
                style={{
                  background: "var(--ternary)",
                  color: "var(--white)",
                }}
              >
                <div className="flex items-center gap-3">
                  <i className="fas fa-clipboard-list text-md mb-2"></i>
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
                        className="accent-green-400 cursor-pointer"
                      />
                      {service}
                    </label>
                  ))}
                </div>
              </div>

              <div
                className="flex items-center gap-3 px-5 py-2.5 rounded-full focus:outline-none focus-within:ring-2"
                style={{
                  background: "var(--ternary)",
                }}
              >
                <i className="fas fa-business-time text-md" style={{color:"var(--white)"}}></i>
                <input
                  type="number"
                  placeholder="Years of Experience"
                  min="0"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="bg-transparent outline-none w-full"
                  style={{ color: "var(--white)" }}
                />
              </div>

              <div
                className="flex items-center gap-3 px-5 py-2.5 rounded-full focus:outline-none focus-within:ring-2"
                style={{
                  background: "var(--ternary)",
                }}
              >
                <i className="fas fa-calendar-check text-md" style={{color:"var(--white)"}}></i>
                <input
                  type="text"
                  placeholder="Availability (e.g. Mon–Fri, 9am–6pm)"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="bg-transparent outline-none w-full"
                  style={{ color: "var(--white)" }}
                />
              </div>

              <div
                className="flex items-center gap-3 px-5 py-2.5 rounded-full focus:outline-none focus-within:ring-2"
                style={{
                  background: "var(--ternary)",
                  color:"var(--white)"
                }}
              >
                <i className="fas fa-file-upload text-md" style={{color:"var(--white)"}}></i>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setServiceDocs(Array.from(e.target.files))}
                  className="bg-transparent outline-none text-sm w-full file:text-white file:bg-[var(--primary-light)] file:px-2 file:py-1 file:rounded-full file:border-0 file:cursor-pointer file:hover:bg-[var(--accent)] file:transition-all file:duration-200"
                />
              </div>
            </>
          )}

          {state === "Login" && (
            <p
              onClick={() => navigate("/reset-password")}
              className="text-right text-sm cursor-pointer"
              style={{ color: "var(--accent)" }}
            >
              Forgot Password?
            </p>
          )}

          <button
            className="w-full py-2.5 rounded-full font-medium mt-2"
            style={{
              background: "linear-gradient(130deg, var(--secondary) 0%,var(--accent) 100%)",
              color: "var(--white)",
            }}
          >
            {state}
          </button>
        </form>

        <p className="text-center text-sm mt-2" style={{ color: "var(--primary-light)" }}>
          {state === "Sign Up" ? (
            <>
              Already have an account?{" "}
              <span
                onClick={() => setState("Login")}
                className="cursor-pointer underline"
                style={{ color: "var(--accent)" }}
              >
                Login
              </span>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <span
                onClick={() => setState("Sign Up")}
                className="cursor-pointer underline"
                style={{ color: "var(--accent)" }}
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