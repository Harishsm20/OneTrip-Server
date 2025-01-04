// // models/Destination.js
// import mongoose from "mongoose";

// const StaySchema = new mongoose.Schema({
//   name: String,
//   price: String,
//   beds: Number,
//   baths: Number,
//   wifi: Boolean,
//   capacity: Number,
//   distance: String,
//   time: String,
//   hours: String,
//   location: String,
//   image: String,
// });

// const SpotSchema = new mongoose.Schema({
//   title: String,
//   image: String,
//   alt: String,
//   location: String,
//   route: String,
// });

// const DestinationSchema = new mongoose.Schema({
//   name: { type: String, required: true, unique: true },
//   title: String,
//   subTitle: String,
//   image: String,
//   stays: [StaySchema],
//   gallery: [String], // Array of image URLs
//   about: String,
//   spots: [SpotSchema],
//   category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
// });

// export const Destination = mongoose.model("Destination", DestinationSchema);
import mongoose from "mongoose"; // Ensure mongoose is imported

const DestinationSchema = new mongoose.Schema({
  name: { type: String, required: true }, // `name` is required
  title: { type: String, required: true },
  subTitle: { type: String },
  about: { type: String, required: true },
  image: { type: String },
  gallery: [{ type: String }],
  stays: [
    { name: String, price: Number, beds: Number, baths: Number, wifi: Boolean },
  ],
  spots: [{ title: String, imgSrc: String, location: String }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
});

export const Destination = mongoose.model("Destination", DestinationSchema);
