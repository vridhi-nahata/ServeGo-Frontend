import StarRating from "./StarRating";
import { assets } from "../assets/assets.js";
import { FaHeart } from "react-icons/fa";

export default function ProviderCard({
  provider,
  onProfileClick,
  onBook = () => {},
}) {
  return (
    <div className="w-full max-w-xs bg-white rounded-2xl shadow-lg hover:shadow-2xl transition overflow-hidden flex flex-col">
      <div className="relative mt-6 mb-4">
        {provider.avatarUrl ? (
          <img
            src={provider.avatarUrl}
            alt={provider.name}
            className="w-full h-32 object-cover border-4 border-[var(--primary)] shadow"
          />
        ) : (
          <div className="w-full h-32 bg-[var(--primary-light)] flex items-center justify-center text-4xl font-bold text-[var(--primary)] border-4 border-[var(--primary)] shadow">
            {provider.name?.[0]?.toUpperCase() || "P"}
          </div>
        )}
        <button className="absolute top-2 right-2 bg-white/80 rounded-full p-2 shadow hover:bg-red-100 transition">
          <FaHeart className="text-red-500" />
        </button>
      </div>
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
