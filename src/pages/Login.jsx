import React, { useState, useContext } from "react";
import { SERVICES } from "../constants/services";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import Select from "react-select";
// changes

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
  const [avatar, setAvatar] = useState(null);

const serviceOptions = SERVICES.map((service) => ({
  label: service.name,
  value: service.name,
}));


  // Upload files to Cloudinary
  const uploadFilesToCloudinary = async (files) => {
    const urls = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "unsigned_present");
      formData.append("cloud_name", "dznigwrbk");

      // Detect if it's an image or not
      const isImage = file.type.startsWith("image/");
      // const endpoint = "https://api.cloudinary.com/v1_1/dznigwrbk/image/upload";
      const endpoint = isImage
        ? "https://api.cloudinary.com/v1_1/dznigwrbk/image/upload"
        : "https://api.cloudinary.com/v1_1/dznigwrbk/raw/upload";

      try {
        const res = await axios.post(endpoint, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: false,
        });

        let fileUrl = res.data.secure_url;

        // Only modify raw files to force inline preview
        if (!isImage) {
          fileUrl = fileUrl.replace("/upload/", "/upload/fl_attachment:false/");
        }

        urls.push(fileUrl);
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
      }
    }

    return urls;
  };

  //Upload Avatar to Cloudinary
  const uploadAvatarToCloudinary = async (file) => {
    if (!file) return "";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "unsigned_present");
    formData.append("cloud_name", "dznigwrbk");

    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dznigwrbk/image/upload",
      formData,
      {
        withCredentials: false,
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (state === "Sign Up") {
        let uploadedDocUrls = [];
        let avatarUrl = "";
        // Only upload if provider & files are selected
        if (role === "provider" && serviceDocs.length > 0) {
          uploadedDocUrls = await uploadFilesToCloudinary(serviceDocs);
        }
        // Upload avatar if selected
        if (role === "provider" && avatar) {
          avatarUrl = await uploadAvatarToCloudinary(avatar);
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
              avatarUrl, //Image Url
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
              serviceDocs: uploadedDocUrls,
              avatarUrl,
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
        <p
          className="text-center text-sm mb-2"
          style={{ color: "var(--primary-light)" }}
        >
          {state === "Sign Up"
            ? "Create your account"
            : "Login to your account"}
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Name */}
          {state === "Sign Up" && (
            <div
              className="flex items-center gap-3 px-5 py-2.5 rounded-full focus:outline-none focus-within:ring-2"
              style={{
                background: "var(--ternary)",
              }}
            >
              <i
                className="fas fa-user text-md"
                style={{ color: "var(--white)" }}
              ></i>
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

          {/* Email */}
          <div
            className="flex items-center gap-3 px-5 py-2.5 rounded-full focus:outline-none focus-within:ring-2"
            style={{
              background: "var(--ternary)",
            }}
          >
            <i
              className="fas fa-envelope text-md"
              style={{ color: "var(--white)" }}
            ></i>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent outline-none w-full"
              style={{ color: "var(--white)" }}
            />
          </div>

          {/* Phone */}
          {state === "Sign Up" && (
            <div
              className="flex items-center gap-3 px-5 py-2.5 rounded-full focus:outline-none focus-within:ring-2"
              style={{
                background: "var(--ternary)",
              }}
            >
              <i
                className="fas fa-phone text-md"
                style={{ color: "var(--white)" }}
              ></i>
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

          {/* Password */}
          <div
            className="flex items-center gap-3 px-5 py-2.5 rounded-full focus:outline-none focus-within:ring-2"
            style={{
              background: "var(--ternary)",
            }}
          >
            <i
              className="fas fa-lock text-md"
              style={{ color: "var(--white)" }}
            ></i>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent outline-none w-full"
              style={{ color: "var(--white)" }}
            />
          </div>

          {/* Role */}
          {state === "Sign Up" && (
            <div
              className="flex items-center gap-3 w-full px-5 py-2.5 rounded-full focus:outline-none focus-within:ring-2"
              style={{
                background: "var(--ternary)",
                color: "var(--white)",
              }}
            >
              <i
                className="fas fa-user-tag text-md"
                style={{ color: "var(--white)" }}
              ></i>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-transparent outline-none cursor-pointer"
                style={{ color: "var(--white)", background: "var(--ternary)" }}
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

          {/* Provider specific fields */}
          {/* Services */}
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
                    <label
                      key={service.name}
                      className="flex items-center gap-1"
                    >
                      <input
                        type="checkbox"
                        value={service.name}
                        checked={servicesOffered.includes(service.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setServicesOffered([
                              ...servicesOffered,
                              service.name,
                            ]);
                          } else {
                            setServicesOffered(
                              servicesOffered.filter((s) => s !== service.name)
                            );
                          }
                        }}
                        className="accent-green-400 cursor-pointer"
                      />
                      {service.name}
                    </label>
                  ))}
                </div>
              </div> 

              {/* Experience */}
              <div
                className="flex items-center gap-3 px-5 py-2.5 rounded-full focus:outline-none focus-within:ring-2"
                style={{
                  background: "var(--ternary)",
                }}
              >
                <i
                  className="fas fa-business-time text-md"
                  style={{ color: "var(--white)" }}
                ></i>
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

              {/* Availability */}
              <div
                className="flex items-center gap-3 px-5 py-2.5 rounded-full focus:outline-none focus-within:ring-2"
                style={{
                  background: "var(--ternary)",
                }}
              >
                <i
                  className="fas fa-calendar-check text-md"
                  style={{ color: "var(--white)" }}
                ></i>
                <input
                  type="text"
                  placeholder="Availability (e.g. Mon–Fri, 9am–6pm)"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="bg-transparent outline-none w-full"
                  style={{ color: "var(--white)" }}
                />
              </div>

              {/* Document Upload */}
              <div
                className="flex flex-col gap-2 px-5 py-2.5 rounded-3xl focus:outline-none"
                style={{ background: "var(--ternary)", color: "var(--white)" }}
              >
                {/* Upload Button + Info */}
                <div className="flex items-center gap-4 flex-wrap">
                  <i className="fas fa-file-upload text-md text-white"></i>

                  {/* Choose Files Button */}
                  <label
                    className="text-xs bg-[var(--primary-light)] px-3 py-1 rounded-full cursor-pointer hover:bg-[var(--accent)] transition-all"
                    style={{ color: "var(--white)" }}
                  >
                    Choose Files
                    <input
                      type="file"
                      multiple
                      onChange={(e) =>
                        setServiceDocs((prev) => [
                          ...prev,
                          ...Array.from(e.target.files),
                        ])
                      }
                      className="hidden"
                    />
                  </label>

                  {/* Info label */}
                  <span className="text-xs">
                    {serviceDocs.length > 0
                      ? `${serviceDocs.length} file(s) selected`
                      : "Document / Certificate"}
                  </span>
                </div>

                {/* File List */}
                {serviceDocs.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {serviceDocs.map((file, index) => (
                      <div
                        key={index}
                        className="text-white text-xs flex gap-1 items-center"
                      >
                        <span
                          className="truncate max-w-[2550px] pl-7"
                          title={file.name}
                        >
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...serviceDocs];
                            updated.splice(index, 1);
                            setServiceDocs(updated);
                          }}
                          className="text-red-300 hover:text-red-500 ml-1"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Profile Picture */}
              <div
                className="flex items-center justify-between gap-3 px-5 py-2.5 rounded-full focus:outline-none focus-within:ring-2"
                style={{
                  background: "var(--ternary)",
                  color: "var(--white)",
                }}
              >
                <i
                  className="fas fa-image text-md"
                  style={{ color: "var(--white)" }}
                ></i>

                {/* Actual Upload Button */}
                <label className="relative inline-block">
                  <span className="text-white text-xs bg-[var(--primary-light)] px-3 py-1 rounded-full cursor-pointer hover:bg-[var(--accent)] transition-all">
                    Browse
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatar(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>

                {/* File name & remove icon */}
                <div className="flex items-center gap-2 w-full justify-between">
                  <span className="text-xs truncate" title={avatar?.name}>
                    {avatar ? avatar.name : "Upload Profile Picture"}
                  </span>
                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar(null)}
                      className="text-red-300 hover:text-red-500 text-sm"
                      title="Remove"
                    >
                      &times;
                    </button>
                  )}
                </div>
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
              background:
                "linear-gradient(130deg, var(--secondary) 0%,var(--accent) 100%)",
              color: "var(--white)",
            }}
          >
            {state}
          </button>
        </form>

        <p
          className="text-center text-sm mt-2"
          style={{ color: "var(--primary-light)" }}
        >
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
