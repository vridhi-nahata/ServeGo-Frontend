import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import StarRating from "../components/StarRating";
import { assets } from "../assets/assets";
import BookingForm from "../components/BookingForm";

export default function ProviderProfile() {
  const { providerId } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/user/provider-profile?id=${providerId}`, {
        withCredentials: true,
      })
      .then((res) => {
        setProvider(res.data.provider);
        setLoading(false);
      })
      .catch((err) => {
        // setErrorMessage("Error loading provider details");
        setLoading(false);
      });
  }, [providerId]);

  if (loading) {
    return <div className="text-center mt-20 text-lg">Loading...</div>;
  }

  if (!provider) {
    return (
      <div className="text-center mt-20 text-red-500">Provider not found</div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-6 bg-gradient-to-br from-[var(--primary-light)] to-[var(--white)]">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Avatar */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-[var(--primary-light)] to-[var(--accent)] flex items-center justify-center text-5xl font-bold text-white shadow-lg mb-2 border-4 border-[var(--primary)]">
            {provider.avatarUrl ? (
              <img
                src={provider.avatarUrl}
                alt={provider.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              provider.name?.[0]?.toUpperCase() || "P"
            )}
          </div>

          {/* Basic Info */}
          <div className="sm:pl-10 pt-2 pb-6 flex flex-col gap-2 items-center sm:items-start">
            {/* Name */}
            <h2 className="text-2xl font-bold text-[var(--primary)] leading-tight">
              {provider.name}
            </h2>

            {/* Role */}
            <p className="text-[var(--gray)] text-md">Service Provider</p>

            {/* Verification Badge */}
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium w-fit ${
                provider.isAccountVerified
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {provider.isAccountVerified ? "Verified" : "Not Verified"}
            </span>

            {/* Rating */}
            <div className="pt-1">
              <StarRating rating={provider.rating || 0} />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center sm:justify-start gap-6 pt-5">
              <button title="Voice Call" className="group">
                <img
                  src={assets.voice_call}
                  alt="Voice Call"
                  className="w-7 h-7 transition-transform duration-200 group-hover:scale-125"
                />
              </button>
              <button title="Video Call" className="group">
                <img
                  src={assets.video_call}
                  alt="Video Call"
                  className="w-7 h-7 transition-transform duration-200 group-hover:scale-125"
                />
              </button>
              <button
                title="Book Now"
                onClick={() => setShowBookingForm(true)}
                className="group"
              >
                <img
                  src={assets.booking}
                  alt="Book Now"
                  className="w-7 h-7 transition-transform duration-200 group-hover:scale-125"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 text-[var(--secondary)] text-sm">
          <div>
            <strong>Availability:</strong>{" "}
            <span className="block ml-3 text-var[--secondary]">
              {provider.availability?.map((day, i) => (
                <div key={i}>
                  {day.day}:{" "}
                  <span className="text-xs text-[var(--gray)]">
                    {day.slots
                      .filter(
                        (slot) => slot.from && slot.to && slot.from < slot.to
                      )
                      .map((slot) => `${slot.from} - ${slot.to}`)
                      .join(", ") || "No valid slots"}
                  </span>
                </div>
              ))}
            </span>
          </div>

          <p>
            <strong>Location:</strong>{" "}
            {provider.location
              ? [
                  provider.location.area,
                  provider.location.city,
                  provider.location.state,
                  provider.location.country,
                  provider.location.pinCode,
                ]
                  .filter(Boolean) // Remove any empty parts
                  .join(", ")
              : "Not specified"}
          </p>

         {/* Services Offered */}
          <div className="sm:col-span-2 mt-4">
            <strong>Services Offered With Experience:</strong>
            <ul className="list-disc pl-6 mt-1 text-[var(--secondary)] space-y-2">
              {Object.entries(
                provider.servicesOffered?.reduce((acc, bundle) => {
                  const category = bundle.category;
                  const subcategory = bundle.subcategory;
                  if (!acc[category]) {
                    acc[category] = {};
                  }
                  if (!acc[category][subcategory]) {
                    acc[category][subcategory] = new Set();
                  }
                  bundle.services.forEach((service) =>
                    acc[category][subcategory].add(service)
                  );
                  return acc;
                }, {})
              ).map(([category, subcats]) => (
                <li key={category}>
                  <div className="font-bold">{category}</div>
                  <ul className="list-[circle] pl-5 mt-1 space-y-1">
                    {Object.entries(subcats).map(([subcategory, services]) => (
                      <li key={subcategory}>
                        <div className="font-medium">{subcategory}</div>
                        <ul className="list-none pl-3">
                          {[...services].map((service) => (
                            <li key={service}>
                              {service}
                              {provider.experiencePerService?.[service] && (
                                <span className="text-xs text-[var(--gray)] ml-2">
                                  ({provider.experiencePerService[service]}{" "}
                                  {provider.experiencePerService[service] === 1
                                    ? "year"
                                    : "years"}
                                  )
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Documents section */}
        <div>
          {provider.serviceDocs?.length > 0 && (
            <div className="w-full mt-6">
              <h3 className="text-xl font-semibold text-[var(--primary)] mb-3">
                Work Demo
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {provider.serviceDocs.map((docUrl, index) => {
                  // Uses a regex to check if the file is an image (based on its file extension)
                  const isImage = /\.(jpg|jpeg|png|gif)$/i.test(docUrl);

                  return (
                    <div
                      key={index}
                      className="border p-3 rounded-lg shadow hover:shadow-md transition text-center"
                    >
                      {isImage ? (
                        <a
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={docUrl}
                            alt={`Document ${index + 1}`}
                            className="w-full h-40 object-contain rounded mb-2"
                          />
                        </a>
                      ) : (
                        <div className="flex flex-col items-center text-[var(--primary)]">
                          <i className="fas fa-file-alt text-4xl mb-2"></i>
                          <a
                            href={`https://docs.google.com/viewer?url=${encodeURIComponent(
                              docUrl
                            )}&embedded=true`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm underline break-all truncate w-full inline-block" // Tailwind’s truncate utility - limiting file name length in display to avoid layout issues
                          >
                            {decodeURIComponent(docUrl.split("/").pop())}
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <BookingForm
          provider={provider}
          serviceName={
            provider.servicesOffered?.[0]?.services?.[0] || "Service"
          }
          onClose={() => {
            setShowBookingForm(false);
            setErrorMessage("");
            setSuccessMessage("");
          }}
          showCalendar={showCalendar}
          setShowCalendar={setShowCalendar}
          onSubmit={async ({ date, timeSlot, notes }) => {
            try {
              const bookingData = {
                provider: provider._id,
                serviceName: provider.servicesOffered?.[0] || "Service",
                date,
                timeSlot,
                notes: notes || "",
              };

              const res = await axios.post(
                "http://localhost:5000/api/bookings",
                bookingData,
                { withCredentials: true }
              );

              return {
                success: res.data.success,
                message: res.data.message,
              };
            } catch (err) {
              const msg =
                err.response?.data?.message ||
                err.message ||
                "Something went wrong";
              setErrorMessage(msg);
              setSuccessMessage("");
              return {
                success: false,
                message: msg,
              };
            }
          }}
        />
      )}
    </div>
  );
}
