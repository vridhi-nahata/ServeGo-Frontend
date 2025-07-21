import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BookingForm from "../components/BookingForm";
import ReactStars from "react-rating-stars-component";

export default function ProviderProfile() {
  const { providerId } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [reviews, setReviews] = useState([]);

  const FractionalStars = ({ rating }) => {
    const percent = (Math.max(0, Math.min(5, rating)) / 5) * 100;
    return (
      <div className="flex justify-end items-center mt-1">
        <div
          className="flex text-2xl text-yellow-400"
          style={{
            background: `linear-gradient(90deg, #facc15 ${percent}%, #e5e7eb ${percent}%)`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          ★★★★★
        </div>
      </div>
    );
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, reviewsRes] = await Promise.all([
          axios.get(
            `http://localhost:5000/api/user/provider-profile?id=${providerId}`,
            {
              withCredentials: true,
            }
          ),
          axios.get(
            `http://localhost:5000/api/user/provider-reviews/${providerId}`,
            {
              withCredentials: true,
            }
          ),
        ]);
        setProvider(profileRes.data.provider);
        setReviews(reviewsRes.data.reviews || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [providerId]);

  if (loading) {
    return <div className="text-center mt-20 text-lg">Loading...</div>;
  }

  if (!provider) {
    return (
      <div className="text-center mt-20 text-red-700">Provider not found</div>
      // <div className="text-center mt-40">
      //     <img
      //       src="/icons/unauthorized-access.webp"
      //       alt="No results"
      //       className="w-52 mx-auto"
      //     />
      //     <h3 className="text-4xl text-[var(--primary)] font-semibold">
      //       Access Denied
      //     </h3>
      //     <p className="text-xl text-[var(--gray)] mt-3">This page is only available to service providers</p>
      //   </div>
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

            {/* Verification Badge
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium w-fit ${
                provider.isAccountVerified
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {provider.isAccountVerified ? "Verified" : "Not Verified"}
            </span> */}

            {/* Action Buttons */}
            <div className="flex justify-center sm:justify-start gap-6 pt-5">
              {/* <button title="Voice Call" className="group">
                <img
                  src="/icons/voice-call.png"
                  alt="Voice Call"
                  className="w-12 h-9 transition-transform duration-200 group-hover:scale-125"
                />
              </button>
              <button title="Video Call" className="group">
                <img
                  src="/icons/video-call.png"
                  alt="Video Call"
                  className="w-9 h-9 transition-transform duration-200 group-hover:scale-125"
                />
              </button> */}
              <button
                title="Book Now"
                onClick={() => setShowBookingForm(true)}
                className="group"
              >
                <img
                  src="/icons/book-now.png"
                  alt="Book Now"
                  className="w-12 h-12 transition-transform duration-200 group-hover:scale-125"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-6 gap-4 flex flex-col text-[var(--secondary)] text-sm">
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
          <div className="sm:col-span-2">
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
        {/* <div>
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
        </div> */}

        {/* Rating overview*/}
        {reviews.length > 0 && (
          
          <div className="mt-8">
            <hr className="my-8 border-gray-300" />

            <h3 className="text-2xl font-bold text-[var(--primary)] mb-6">
              Ratings Overview
            </h3>
            {/* --- STATS BAR --- */}
            <div className="flex justify-between items-center mb-4">
              {/* left: star breakdown */}
              <div className="text-sm text-gray-700 space-y-1">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviews.filter(
                    (r) => r.customerFeedback.rating === stars
                  ).length;
                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="w-12">{stars} star</span>
                      <div className="w-20 sm:w-40 md:w-60 bg-gray-200 rounded-full h-2 transition">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${(count / reviews.length) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* right: total & average */}
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-800">
                  {(
                    reviews.reduce(
                      (sum, r) => sum + r.customerFeedback.rating,
                      0
                    ) / reviews.length
                  ).toFixed(1)}
                  <span className="text-lg text-gray-500">/5</span>
                </div>

                {/* Average stars */}
                {reviews.length > 0 && (
                  <FractionalStars
                    rating={
                      reviews.reduce(
                        (s, r) => s + r.customerFeedback.rating,
                        0
                      ) / reviews.length
                    }
                  />
                )}

                <div className="flex justify-end items-center mt-1">
                  <ReactStars
                    count={5}
                    value={
                      reviews.reduce(
                        (s, r) => s + r.customerFeedback.rating,
                        0
                      ) / reviews.length
                    }
                    size={20}
                    activeColor="#facc15"
                    isHalf={true}
                    edit={false}
                  />
                </div>

                <div className="text-sm text-gray-500">
                  {reviews.length} reviews
                </div>
              </div>
            </div>
          </div>
        )}
       

        {/* Customer Reviews */}
        {reviews.length > 0 && (
          <div className="mt-8 h-120 overflow-y-auto">
             <hr className="my-8 border-gray-300" />
            <h3 className="text-2xl font-bold text-[var(--primary)] mb-6">
              Customer Reviews
            </h3>
            <div className="space-y-4">
              {reviews.map(({ customerFeedback, customer }, idx) => {
                console.log("customer", customer); // <- debug
                return (
                  <div
                    key={idx}
                    className="border rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white shadow"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-2 mb-2">
                        {customer?.avatarUrl ? (
                          <img
                            src={customer.avatarUrl}
                            alt={customer.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-bold">
                            {customer?.name?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                        <span className="text-sm font-medium">
                          {customer.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${
                            i < (customerFeedback?.rating || 0)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {customerFeedback?.rating}/5
                      </span>
                    </div>

                    <p className="text-sm italic text-gray-700">
                      “{customerFeedback?.review || "No comment"}”
                    </p>

                    <p className="text-xs text-gray-400 mt-2">
                      {customerFeedback?.date
                        ? new Date(customerFeedback.date).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
          onSubmit={async ({ date, timeSlot, address, notes }) => {
            try {
              const bookingData = {
                provider: provider._id,
                serviceName: provider.servicesOffered?.[0] || "Service",
                date,
                timeSlot,
                address,
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
