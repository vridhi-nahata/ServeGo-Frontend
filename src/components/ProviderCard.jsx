import StarRating from "./StarRating";
import { assets } from "../assets/assets.js";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";

export default function ProviderCard({
  provider,
  isWishlisted: initialWishlisted,
  onProfileClick,
  onBook = () => {},
}) {
  const navigate = useNavigate();
  const [authMessage, setAuthMessage] = useState("");

  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const { backendUrl } = useContext(AppContext);
  useEffect(() => {
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);
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
          navigate("/login");
        }, 3000);
        return;
      }
      if (data.success) {
        setIsWishlisted(data.action === "added");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setAuthMessage("Please log in to manage your wishlist.");
        setTimeout(() => {
          setAuthMessage(""); //clear message after 2s
          navigate("/login");
        }, 2000); // redirect after 2 seconds
      } else {
        toast.error(error.message || "Something went wrong");
      }
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
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <FaHeart
            className={`transition duration-200 cursor-pointer ${
              isWishlisted ? "text-red-500" : "text-gray-400"
            } hover:transition-transform duration-200 hover:scale-125`}
          />
        </button>
      </div>
      {authMessage && (
        <div className="mt-3 flex justify-center">
          <span className="text-sm text-red-700 bg-red-100 px-3 py-1 rounded-md">
            {authMessage}
          </span>
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
            Experience: <b>{provider.experienceYears || 0}</b> years
          </span>
          <span>
            Availability: <b>{provider.availability || "N/A"}</b>
          </span>
        </div>

        <div className="flex items-center justify-evenly mb-4">
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
            title="View Profile"
            onClick={onProfileClick}
            className="group"
          >
            <img
              src={assets.user}
              alt="View Profile"
              className="w-7 h-7 transition-transform duration-200 group-hover:scale-125"
            />
          </button>
        </div>
        <div className="flex items-center justify-center">
          <button
            onClick={onBook}
            className="mb-2 w-full py-2 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--secondary)] text-white font-bold shadow hover:scale-105 transition"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
