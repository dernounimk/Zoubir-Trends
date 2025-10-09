// components/StarRating.jsx
import { useState } from "react";
import { Star } from "lucide-react";

const StarRating = ({ rating, setRating }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((star) => (
        <button
          key={star}
          type="button"
          className="focus:outline-none"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
        >
          <Star
            size={28}
            className={`cursor-pointer transition-colors ${
              (hover || rating) >= star
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-400"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
