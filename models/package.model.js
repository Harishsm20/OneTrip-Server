import mongoose from "mongoose";

const AgendaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const PackageSchema = new mongoose.Schema({
  packageId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  location: [
    {
      type: String,
      required: true,
    },
  ],
  duration: {
    nights: {
      type: Number,
      required: true,
    },
    days: {
      type: Number,
      required: true,
    },
  },
  tourType: {
    type: String,
    required: true,
  },
  groupSize: {
    type: String,
    required: true,
  },
  languages: [
    {
      type: String,
      required: true,
    },
  ],
  description: {
    type: String,
    required: true,
  },
  agenda: {
    type: [AgendaSchema],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: [String], // Stores an array of image names for the gallery
    required: false,
  },
});

export const Package = mongoose.model("Package", PackageSchema);
