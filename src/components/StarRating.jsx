import { FaStar } from "react-icons/fa";

function StarRating({ rating }) {
  return (
    <span className="flex items-center gap-1 text-yellow-500">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={star <= Math.round(rating) ? "text-yellow-500" : "text-gray-300"}
        />
      ))}
    </span>
  );
}

export default StarRating;