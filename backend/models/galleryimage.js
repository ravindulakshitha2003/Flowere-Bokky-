import mongoose from "mongoose";

const galleryimageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    occasion: {
      type: String,
      required: true,
      enum: ["Weddings", "Birthdays", "Anniversaries", "Corporate", "Just Because"],
    },
    type: {
      type: String,
      required: true,
      enum: ["Natural Flowers", "Ribbon Flowers", "Handcrafted", "Mixed Arrangements"],
    },
    tab: {
      type: String,
      required: true,
      enum: ["work", "events", "custom", "showcase"],
      default: "work",
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

const galleryimage = mongoose.model("galleryimage", galleryimageSchema);

export default galleryimage;