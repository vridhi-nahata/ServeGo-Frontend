// changes
import React, { useState, useContext, useEffect, useRef } from "react";
import { SERVICES } from "../constants/services";
console.log("SERVICES after import", SERVICES);

import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import Select from "react-select";
import AvailabilitySelector from "../components/AvailabilitySelector";
import { Country, State, City } from "country-state-city";
const flatServices = SERVICES.flat();

function Login() {
  const navigate = useNavigate();

  const { backendUrl, setIsLoggedIn, setUserData } = useContext(AppContext);

  const [state, setState] = useState("Login"); // "Login" or "Sign Up"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [area, setArea] = useState("");
  const [pinCode, setPinCode] = useState("");

  const [servicesOffered, setServicesOffered] = useState([]);
  const [experiencePerService, setExperiencePerService] = useState({});
  const [serviceDocs, setServiceDocs] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const [formError, setFormError] = useState("");
  const [error, setError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [serviceBundles, setServiceBundles] = useState([]);

  const [newBundle, setNewBundle] = useState({
    category: null,
    subcategory: null,
    services: [],
  });

  const availabilityRef = useRef([]);

  console.log("SERVICES:", SERVICES);

  const handleAddBundle = () => {
    if (!newBundle.category) {
      setError("Select category");
      return;
    }
    if (!newBundle.subcategory) {
      setError("Select subcategory");
      return;
    }
    if (newBundle.services.length === 0) {
      setError("Add at least one service");
      return;
    }
    setServiceBundles((prev) => [...prev, { ...newBundle }]);
    setError("");
    // Reset new bundle inputs
    setNewBundle({
      category: null,
      subcategory: null,
      services: [],
    });
  };

  const subcategoryOptionsFor = (category) =>
    Array.from(
      new Set(
        flatServices
          .filter((s) => s.category === category)
          .map((s) => s.subcategory)
      )
    ).map((sc) => ({ label: sc, value: sc }));

  const serviceOptionsFor = (category, subcategory) =>
    flatServices
      .filter((s) => s.category === category && s.subcategory === subcategory)
      .map((s) => ({ label: s.name, value: s.name }));

  // Flatten all nested arrays
  const flatServices = SERVICES.flat(Infinity).flatMap((subcategory) =>
    (subcategory.services ?? []).map((service) => ({
      category: subcategory.category,
      subcategory: subcategory.subcategory,
      name: service.name,
    }))
  );

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
      } catch (error) {
        console.error("Cloudinary upload failed:", error);
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

  // Clear Error or Success message automatically after 2 sec
  useEffect(() => {
    if (formSuccess || formError) {
      const timer = setTimeout(() => {
        setFormSuccess("");
        setFormError("");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formSuccess, formError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    try {
      if (state === "Sign Up") {
        // Atleast 1 service
        if (role === "provider" && serviceBundles.length === 0) {
          setFormError("Please select at least one service");
          return;
        }
        if (
          !selectedCountry ||
          !selectedState ||
          !selectedCity ||
          !area.trim() ||
          !pinCode.trim()
        ) {
          setFormError("Missing required fields");
          return;
        }

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

        const location = {
          country: selectedCountry?.name || "",
          state: selectedState?.name || "",
          city: selectedCity?.name || "",
          area: area.trim(),
          pinCode: pinCode.trim(),
        };

        // Send registration data, get OTP
        const { data } = await axios.post(
          `${backendUrl}/api/auth/send-verify-otp`,
          {
            name,
            email,
            phone,
            password,
            role,
            location,
            ...(role === "provider" && {
              servicesOffered: serviceBundles,
              experiencePerService,
              availability: availabilityRef.current,
              serviceDocs: uploadedDocUrls, // Use uploaded URLs
            }),
            avatarUrl, //Image Url
          },
          { withCredentials: true }
        );
        console.log(data);
        if (data.success) {
          setIsLoggedIn(true);
          setFormSuccess("OTP sent to your email");
          // Wait for 1 second, then navigate
          setTimeout(() => {}, 1000); // 1000 ms = 1 second
          // Temporarily store user data in localStorage to use during OTP verification
          localStorage.setItem(
            "tempUserData",
            JSON.stringify({
              name,
              email,
              phone,
              password,
              role,
              location,
              servicesOffered,
              experiencePerService,
              availability: availabilityRef.current,
              serviceDocs: uploadedDocUrls,
              avatarUrl,
            })
          );
          navigate("/email-verify"); // redirect to EmailVerify.jsx
        } else {
          setFormError(data.message);
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
          setFormSuccess(data.message);
          // Wait for 1 second, then navigate
          setTimeout(() => {
            navigate("/");
          }, 1000); // 1000 ms = 1 second
        } else {
          setFormError(data.message);
        }
      }
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong."
      );
    }
  };

  const categoryOptions = Array.from(
    new Set(flatServices.map((s) => s.category))
  ).map((c) => ({ label: c, value: c }));

  const groupedServices = {};

  serviceBundles.forEach((bundle) => {
    const { category, subcategory, services } = bundle;
    if (!groupedServices[category]) {
      groupedServices[category] = {};
    }
    if (!groupedServices[category][subcategory]) {
      groupedServices[category][subcategory] = [];
    }
    services.forEach((s) => {
      if (!groupedServices[category][subcategory].includes(s)) {
        groupedServices[category][subcategory].push(s);
      }
    });
  });

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
          className="text-xl sm:text-2xl md:text-3xl font-semibold text-center pb-1"
          style={{ color: "var(--white)" }}
        >
          {state === "Sign Up" ? "Create Account" : "Login"}
        </h2>

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
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent outline-none w-full"
              style={{ color: "var(--white)" }}
            />
            <i
              onClick={() => setShowPassword(!showPassword)}
              className={`fas ${
                showPassword ? "fa-eye-slash" : "fa-eye"
              } cursor-pointer`}
              style={{ color: "var(--white)" }}
            />
          </div>

          {/* Location */}
          {state === "Sign Up" && (
            <div className="flex flex-col gap-4">
              {/* Country Dropdown */}
              <div
                className="flex items-center gap-3 px-5 py-2.5 rounded-full focus:outline-none focus-within:ring-2"
                style={{ background: "var(--ternary)", color: "var(--white)" }}
              >
                <i className="fas fa-flag text-md" />
                <select
                  value={selectedCountry?.isoCode || ""}
                  onChange={(e) => {
                    const country = Country.getCountryByCode(e.target.value);
                    setSelectedCountry(country);
                    setSelectedState(null);
                    setSelectedCity(null);
                  }}
                  className="w-full bg-transparent outline-none cursor-pointer"
                  style={{
                    color: "var(--white)",
                    background: "var(--ternary)",
                  }}
                >
                  <option value="">-- Select Country --</option>
                  {Country.getAllCountries().map((c) => (
                    <option key={c.isoCode} value={c.isoCode}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* State Dropdown */}
              {selectedCountry && (
                <div
                  className="flex items-center gap-3 px-5 py-2.5 rounded-full focus:outline-none focus-within:ring-2"
                  style={{
                    background: "var(--ternary)",
                    color: "var(--white)",
                  }}
                >
                  <i className="fas fa-map-marker-alt text-md" />
                  <select
                    value={selectedState?.isoCode || ""}
                    onChange={(e) => {
                      const allStates = State.getStatesOfCountry(
                        selectedCountry.isoCode
                      );
                      const state = allStates.find(
                        (s) => s.isoCode === e.target.value
                      );
                      setSelectedState(state);
                      setSelectedCity(null);
                    }}
                    className="w-full bg-transparent outline-none cursor-pointer"
                    style={{
                      color: "var(--white)",
                      background: "var(--ternary)",
                    }}
                  >
                    <option value="">-- Select State --</option>
                    {State.getStatesOfCountry(selectedCountry.isoCode).map(
                      (s) => (
                        <option key={s.isoCode} value={s.isoCode}>
                          {s.name}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}

              {/* City Dropdown */}
              {selectedState && (
                <div
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full focus:outline-none focus-within:ring-2"
                  style={{
                    background: "var(--ternary)",
                    color: "var(--white)",
                  }}
                >
                  <i className="fas fa-city text-sm" />
                  <select
                    value={selectedCity?.name || ""}
                    onChange={(e) => {
                      const allCities = City.getCitiesOfState(
                        selectedCountry.isoCode,
                        selectedState.isoCode
                      );
                      const city = allCities.find(
                        (c) => c.name === e.target.value
                      );
                      setSelectedCity(city);
                    }}
                    className="w-full bg-transparent outline-none cursor-pointer"
                    style={{
                      color: "var(--white)",
                      background: "var(--ternary)",
                    }}
                  >
                    <option value="">-- Select City --</option>
                    {City.getCitiesOfState(
                      selectedCountry.isoCode,
                      selectedState.isoCode
                    ).map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Area Text */}
              <div
                className="flex items-center gap-3 px-5 py-2.5 rounded-full focus:outline-none focus-within:ring-2"
                style={{ background: "var(--ternary)", color: "var(--white)" }}
              >
                <i className="fas fa-location-arrow text-md" />
                <input
                  type="text"
                  placeholder="Area / Locality"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="bg-transparent outline-none w-full"
                  style={{ color: "var(--white)" }}
                />
              </div>

              {/* PinCode Text */}
              <div
                className="flex items-center gap-3 px-5 py-2.5 rounded-full focus:outline-none focus-within:ring-2"
                style={{ background: "var(--ternary)", color: "var(--white)" }}
              >
                <i className="fas fa-mail-bulk text-sm" />
                <input
                  type="text"
                  placeholder="Pin Code"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="bg-transparent outline-none w-full"
                  style={{ color: "var(--white)" }}
                />
              </div>
            </div>
          )}

          {/* Profile Picture */}
          {state === "Sign Up" && (
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
                <span className="text-white text-xs bg-[var(--primary-light)] px-3 py-1 rounded-xl cursor-pointer hover:bg-[var(--accent)] transition-all">
                  Browse
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatar(e.target.files[0])}
                  className="absolute inset-0 opacity-0 pointer-events-none"
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
          )}

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
                className="fas fa-user-tag text-sm"
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
          {state === "Sign Up" && role === "provider" && (
            <>
              {/* Services */}
              <div
                className="w-full px-5 py-2.5 rounded-2xl"
                style={{
                  background: "var(--ternary)",
                  color: "var(--white)",
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <i className="fas fa-clipboard-list text-md"></i>
                  <label className="block text-sm">Services Offered</label>
                </div>

                {/* Category */}
                <Select
                  key={newBundle.category ?? "empty"}
                  placeholder="Select Category"
                  options={categoryOptions}
                  value={categoryOptions.find(
                    (opt) => opt.value === newBundle.category
                  )}
                  onChange={(opt) => {
                    setNewBundle({
                      category: opt?.value ?? null,
                      subcategory: null,
                      services: [],
                    });
                  }}
                  className="text-black text-sm mb-2"
                />

                {/* Subcategory */}
                {newBundle.category && (
                  <Select
                    key={newBundle.subcategory ?? "empty"}
                    placeholder="Select Subcategory"
                    options={subcategoryOptionsFor(newBundle.category)}
                    value={
                      newBundle.subcategory
                        ? subcategoryOptionsFor(newBundle.category).find(
                            (opt) => opt.value === newBundle.subcategory
                          )
                        : null
                    }
                    onChange={(opt) => {
                      setNewBundle((prev) => ({
                        ...prev,
                        subcategory: opt?.value ?? null,
                        services: [],
                      }));
                    }}
                    className="text-black text-sm mb-2"
                  />
                )}

                {/* Services */}
                {newBundle.subcategory && (
                  <Select
                    placeholder="Select Services"
                    options={serviceOptionsFor(
                      newBundle.category,
                      newBundle.subcategory
                    )}
                    isMulti
                    value={serviceOptionsFor(
                      newBundle.category,
                      newBundle.subcategory
                    ).filter((opt) => newBundle.services.includes(opt.value))}
                    onChange={(selected) => {
                      const selectedValues = selected.map((opt) => opt.value);
                      setNewBundle((prev) => ({
                        ...prev,
                        services: selectedValues,
                      }));
                    }}
                    className="text-black text-sm"
                  />
                )}

                <button
                  type="button"
                  onClick={handleAddBundle}
                  className="mt-2 text-xs bg-[var(--primary-light)] px-3 py-1 rounded-xl cursor-pointer hover:bg-[var(--accent)] transition-all"
                >
                  Add service
                </button>

                {error && (
                  <div className="mt-2 px-2 text-xs text-red-400 flex items-center gap-2">
                    <i className="fas fa-exclamation-circle"></i>
                    {error}
                  </div>
                )}

                {/* List of selected services */}
                <div className="mt-4 space-y-4">
                  {Object.entries(groupedServices).map(
                    ([category, subcategories]) => (
                      <div
                        key={category}
                        className="border border-gray-500 rounded-lg p-3 bg-[var(--ternary)] text-white"
                      >
                        <div className="text-sm font-semibold mb-2">
                          {category}
                        </div>

                        {Object.entries(subcategories).map(
                          ([subcategory, services]) => (
                            <div
                              key={subcategory}
                              className="mb-3 pl-2 border-l border-gray-500"
                            >
                              <div className="text-xs font-medium mb-1">
                                {subcategory}
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {services.map((service) => (
                                  <div
                                    key={service}
                                    className="flex justify-between items-center w-full bg-transparent px-2 py-1 rounded-md text-xs"
                                  >
                                    <span className="truncate w-[160px]">
                                      {service}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="number"
                                        min="0"
                                        placeholder="Exp"
                                        value={
                                          experiencePerService[service] || ""
                                        }
                                        onChange={(e) =>
                                          setExperiencePerService((prev) => ({
                                            ...prev,
                                            [service]: e.target.value,
                                          }))
                                        }
                                        className="w-12 bg-[var(--white)] border border-white outline-none text-black text-xs text-center"
                                      />
                                      <span>yr</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        // Remove from serviceBundles
                                        setServiceBundles((prev) =>
                                          prev
                                            .map((bundle) => {
                                              if (
                                                bundle.category === category &&
                                                bundle.subcategory ===
                                                  subcategory
                                              ) {
                                                return {
                                                  ...bundle,
                                                  services:
                                                    bundle.services.filter(
                                                      (s) => s !== service
                                                    ),
                                                };
                                              }
                                              return bundle;
                                            })
                                            .filter(
                                              (b) => b.services.length > 0
                                            )
                                        );
                                      }}
                                      className="text-red-300 hover:text-red-500 text-xs"
                                      title="Remove Service"
                                    >
                                      <i className="fas fa-times"></i>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Availability */}
              <div className="bg-[var(--ternary)] p-3 rounded-xl text-white">
                <div className="flex items-center gap-3 mb-2 px-3">
                  <i className="fas fa-calendar-check text-sm"></i>
                  <label className="block text-sm">Availability</label>
                </div>
                <AvailabilitySelector
                  onChange={(data) => (availabilityRef.current = data)}
                />
              </div>

              {/* Document Upload */}
              <div
                className="flex flex-col px-5 py-2.5 rounded-3xl focus:outline-none"
                style={{ background: "var(--ternary)", color: "var(--white)" }}
              >
                {/* Upload Button + Info */}
                <div className="flex items-center gap-3 flex-wrap">
                  <i className="fas fa-file-upload text-md text-white"></i>

                  {/* Choose Files Button */}
                  <label
                    className="text-xs bg-[var(--primary-light)] px-3 py-1 rounded-xl cursor-pointer hover:bg-[var(--accent)] transition-all"
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
                      : "Work Demo"}
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

          {/* Inline Error Message */}
          {formError && (
            <div className="text-sm text-red-400 text-center flex items-center justify-center gap-2">
              <i className="fas fa-exclamation-circle"></i>
              {formError}
            </div>
          )}

          {/* Inline Success Message */}
          {formSuccess && (
            <div className="text-sm text-green-300 text-center flex items-center justify-center gap-2">
              <i className="fas fa-check-circle"></i>
              {formSuccess}
            </div>
          )}

          <button
            type="submit"
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
