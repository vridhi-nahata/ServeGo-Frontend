import StarRating from "./StarRating";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import BookingForm from "./BookingForm";
// import AgoraCall from './AgoraCall.jsx'

export default function ProviderCard({
  provider,
  serviceName,
  isWishlisted: initialWishlisted,
  onProfileClick,
}) {
  const navigate = useNavigate();
  const [authMessage, setAuthMessage] = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);

  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);

  const { backendUrl,getUserData } = useContext(AppContext);
  useEffect(() => {
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  // Handle wishlist
  const handleWishlist = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/wishlist`,
        { providerId: provider._id },
        { withCredentials: true }
      );
      //  check if user is not authenticated from response body
      if (
        !data.success &&
        data.message?.toLowerCase().includes("unauthorized")
      ) {
        setAuthMessage("Please log in to manage your wishlist.");
        setTimeout(() => {
          setAuthMessage("");
        }, 2000);
        return;
      }
      if (data.success) {
        setIsWishlisted(data.action === "added");
        getUserData();
      }
    } catch (error) {
      setAuthMessage(error.message || "Something went wrong");
    }
  };
  // Handle booking
  const handleBookingSubmit = async (bookingData) => {
    try {
      const res = await axios.post(`${backendUrl}/api/bookings`, bookingData, {
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Booking failed",
      };
    }
  };

  return (
    <div className="w-full max-w-md sm:max-w-xs bg-white rounded-2xl shadow-lg hover:shadow-2xl transition overflow-hidden flex flex-col">
      <div className="relative mt-6">
        {provider.avatarUrl ? (
          <img
            src={provider.avatarUrl}
            alt={provider.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-[var(--primary)] shadow-lg mx-auto transition-transform duration-200 hover:scale-125"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-4xl font-bold text-[var(--primary)] border-4 border-[var(--primary)] shadow-lg mx-auto">
            {provider.name?.[0]?.toUpperCase()}
          </div>
        )}

        {/* Wishlist button */}
        <button
          className="absolute top-1 right-4 rounded-full p-2 transition"
          onClick={handleWishlist}
          title={isWishlisted ? "Remove from favourite" : "Add to favourite"}
        >
          <FaHeart
            className={`transition duration-200 cursor-pointer ${
              isWishlisted ? "text-red-500" : "text-gray-400"
            } hover:transition-transform duration-200 hover:scale-125`}
          />
        </button>
      </div>

      {/* Inline Error Message */}
      {authMessage && (
        <div className="mt-3 flex items-center justify-center text-red-500">
          <i className="fas fa-exclamation-circle"></i>
          <span className="text-sm px-2 py-1 rounded-md">{authMessage}</span>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg text-[var(--primary)]">
            {provider.name}
          </h3>
          <StarRating rating={provider.rating} />
        </div>

        <div className="flex flex-col gap-1 text-sm text-[var(--secondary)] mb-4 ">
          <span>
            <strong>Experience : </strong>
            {typeof provider.experiencePerService?.[serviceName] === "number"
              ? `${provider.experiencePerService[serviceName]} ${
                  provider.experiencePerService[serviceName] === 1
                    ? "year"
                    : "years"
                }`
              : "N/A"}
          </span>

          {/* Availability */}
          <span>
            <strong>Availability : </strong>

            {Array.isArray(provider.availability) &&
            provider.availability.length > 0
              ? provider.availability.map((day) => `${day.day}`).join(", ")
              : "N/A"}
          </span>
          {/* Location */}
          <p>
            <strong>Location :</strong>{" "}
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
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center justify-evenly mb-4">
          <button title="Voice Call" className="group">
            <img
              src="/icons/voice-call.png"
              alt="Voice Call"
              className="w-10 h-8 transition-transform duration-200 group-hover:scale-125"
            />
          </button>
          <button title="Video Call" className="group">
            <img
              src="/icons/video-call.png"
              alt="Video Call"
              className="w-8 h-8 transition-transform duration-200 group-hover:scale-125"
            />
          </button>
          <button
            title="View Profile"
            onClick={onProfileClick}
            className="group"
          >
            <img
              src="/icons/user-info.webp"
              alt="View Profile"
              className="w-8 h-8 transition-transform duration-200 group-hover:scale-125"
            />
          </button>
        </div>

        {/* Quick action buttons */}
{/* <div className="flex items-center justify-evenly mb-4">
  <button
    title="Voice Call"
    className="group"
    onClick={() => setShowVoiceCall(true)}
  >
    <img
      src="/icons/voice-call.png"
      alt="Voice Call"
      className="w-10 h-8 transition-transform duration-200 group-hover:scale-125"
    />
  </button>

  <button
    title="Video Call"
    className="group"
    onClick={() => setShowVideoCall(true)}
  >
    <img
      src="/icons/video-call.png"
      alt="Video Call"
      className="w-8 h-8 transition-transform duration-200 group-hover:scale-125"
    />
  </button>

  <button
    title="View Profile"
    onClick={onProfileClick}
    className="group"
  >
    <img
      src="/icons/user-info.webp"
      alt="View Profile"
      className="w-8 h-8 transition-transform duration-200 group-hover:scale-125"
    />
  </button>
</div> */}


        <div className="flex items-center justify-center">
          <button
            onClick={() => setShowBooking(true)}
            className="mb-2 w-full py-2 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--secondary)] text-white font-bold shadow hover:scale-105 transition"
          >
            Book Now
          </button>
        </div>
      </div>
      {/* Booking Form Modal */}
      {showBooking && (
        <BookingForm
          provider={provider}
          serviceName={serviceName}
          onClose={() => setShowBooking(false)}
          onSubmit={handleBookingSubmit}
          showCalendar={showCalendar}
          setShowCalendar={setShowCalendar}
        />
      )}

      {/* Video & voice Call Modal */}
{/* {showVideoCall && (
  <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
    <div className="bg-white rounded-xl p-6 w-[90%] max-w-xl">
      <h2 className="text-lg font-semibold mb-4 text-center">Video Call</h2>
      <AgoraCall isVideo={true} onEnd={() => setShowVideoCall(false)} />
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setShowVideoCall(false)}
          className="px-4 py-2 bg-red-600 text-white rounded-full"
        >
          End Call
        </button>
      </div>
    </div>
  </div>
)}


{showVoiceCall && (
  <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
    <div className="bg-white rounded-xl p-6 w-[90%] max-w-xl">
      <h2 className="text-lg font-semibold mb-4 text-center">Voice Call</h2>
      <AgoraCall isVideo={false} onEnd={() => setShowVoiceCall(false)} />
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setShowVoiceCall(false)}
          className="px-4 py-2 bg-red-600 text-white rounded-full"
        >
          End Call
        </button>
      </div>
    </div>
  </div>
)} */}

    </div>
  );
}
