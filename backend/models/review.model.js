// models/review.model.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    instagram: {
      type: String,
      trim: true,
      validate: {
        validator: function (val) {
          if (!val) return true; // instagram optional
          // regex: 1-30 chars, letters/numbers/._, no .., no start/end with .
          return /^(?!.*\.\.)(?!\.)(?!.*\.$)[a-zA-Z0-9._]{1,30}$/.test(val);
        },
        message: "Invalid Instagram username",
      },
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
