// import { Destination } from "../models/destination.model.js";
// import { Category } from "../models/category.model.js";

// // Get destination details by name
// export const getDestinationByName = async (req, res) => {
//   const { name } = req.body;

//   try {
//     const destination = await Destination.findOne({ name });
//     // console.log(destination)
//     if (!destination) {
//       return res.status(404).json({ message: "Destination not found" });
//     }
//     res.status(200).json({ data: destination });
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// // Create a new destination
// export const createDestination = async (req, res) => {
//   const { name, title, subTitle, image, stays, gallery, about, spots, categoryId } =
//     req.body;

//   try {
//     const existingDestination = await Destination.findOne({ name });
//     if (existingDestination) {
//       return res.status(400).json({ message: "Destination already exists" });
//     }

//     const newDestination = new Destination({
//       name,
//       title,
//       subTitle,
//       image,
//       stays,
//       gallery,
//       about,
//       spots,
//       category: categoryId,
//     });

//     await newDestination.save();
//     res.status(201).json({
//       message: "Destination created successfully",
//       data: newDestination,
//     });
//   } catch (error) {
//     console.error("Error creating destination:", error.message);
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// // Update a destination by name
// export const updateDestination = async (req, res) => {
//   const { name } = req.params;
//   const { categoryId, ...updates } = req.body;

//   try {
//     const updatedDestination = await Destination.findOneAndUpdate(
//       { name },
//       { $set: updates },
//       { new: true }
//     );

//     if (!updatedDestination) {
//       return res.status(404).json({ message: "Destination not found" });
//     }

//     if (categoryId) {
//       const category = await Category.findById(categoryId);
//       if (!category) {
//         return res.status(404).json({ message: "Category not found" });
//       }

//       updatedDestination.category = categoryId;
//       await updatedDestination.save();

//       // Optionally, update the category's destination list
//       category.destinations.push(updatedDestination._id);
//       await category.save();
//     }

//     res.status(200).json({
//       message: "Destination updated successfully",
//       data: updatedDestination,
//     });
//   } catch (error) {
//     console.error("Error updating destination:", error.message);
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// // Delete a destination by name
// export const deleteDestination = async (req, res) => {
//   const { name } = req.params;

//   try {
//     const deletedDestination = await Destination.findOneAndDelete({ name });

//     if (!deletedDestination) {
//       return res.status(404).json({ message: "Destination not found" });
//     }

//     res.status(200).json({
//       message: "Destination deleted successfully",
//       data: deletedDestination,
//     });
//   } catch (error) {
//     console.error("Error deleting destination:", error.message);
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// // Get all destinations
// export const getAllDestinations = async (req, res) => {
//   try {
//     const destinations = await Destination.find();

//     if (destinations.length === 0) {
//       return res.status(404).json({ message: "No destinations found" });
//     }

//     res.status(200).json({ data: destinations });
//   } catch (error) {
//     console.error("Error retrieving destinations:", error.message);
//     res.status(500).json({ message: "Server error", error });
//   }
// };

import { Destination } from "../models/destination.model.js";
import { Category } from "../models/category.model.js";
import { uploadImageInBucket, getImageURL } from "./image.controller.js";
import mongoose from "mongoose";

// Get destination details by name
export const getDestinationByName = async (req, res) => {
  const { name } = req.body;

  try {
    const destination = await Destination.findOne({
      name: { $regex: new RegExp("^" + name + "$", "i") },
    });

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    if (destination.image) {
      destination.image = await getImageURL(destination.image);
    }

    if (destination.gallery && destination.gallery.length > 0) {
      destination.galleryUrls = await Promise.all(
        destination.gallery.map((image) => getImageURL(image))
      );
    }

    res.status(200).json({ data: destination });
  } catch (error) {
    console.error("Error fetching destination by name:", error.message);
    res.status(500).json({ message: "Server error", error });
  }
};

export const createDestination = async (req, res) => {
  try {
    const { name, title, subTitle, about, categoryId } = req.body;

    // Parse stays and spots from JSON strings into arrays
    const stays = JSON.parse(req.body.stays || "[]");
    const spots = JSON.parse(req.body.spots || "[]");

    // Check if the destination already exists
    const existingDestination = await Destination.findOne({ name });
    if (existingDestination) {
      return res.status(400).json({ message: "Destination already exists" });
    }

    // Handle the main image upload
    let image = null;
    if (req.files.image) {
      // Upload the image to the bucket and get the image URL
      image = await uploadImageInBucket(
        req.files.image[0].buffer,
        req.files.image[0].mimetype
      );
    }

    // Handle the gallery upload
    let gallerySrc = [];
    if (req.files.gallery) {
      gallerySrc = await Promise.all(
        req.files.gallery.map(async (file) => {
          return await uploadImageInBucket(file.buffer, file.mimetype);
        })
      );
    }

    // Validate categoryId as ObjectId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    // Create a new destination with the provided data
    const newDestination = new Destination({
      name,
      title,
      subTitle,
      image, // The image URL
      gallery: gallerySrc, // The gallery URLs
      stays,
      about,
      spots,
      category: categoryId,
    });

    // Save the destination to the database
    await newDestination.save();

    // Return success response
    res.status(201).json({
      message: "Destination created successfully",
      data: newDestination,
    });
  } catch (error) {
    console.error("Error creating destination:", error.message);
    res.status(500).json({ message: "Server error", error });
  }
};

// Update a destination by name
export const updateDestination = async (req, res) => {
  const { name } = req.params;
  const { categoryId, gallery, ...updates } = req.body;
  const imgFile = req.file; // Image file from request

  try {
    // Upload image if provided
    if (imgFile) {
      const image = await uploadImageInBucket(imgFile.buffer, imgFile.mimetype);
      updates.image = image;
    }

    // Handle the gallery upload if any
    if (gallery && gallery.length > 0) {
      updates.gallery = await Promise.all(
        gallery.map(
          async (file) => await uploadImageInBucket(file.buffer, file.mimetype)
        )
      );
    }

    const updatedDestination = await Destination.findOneAndUpdate(
      { name },
      { $set: updates },
      { new: true }
    );

    if (!updatedDestination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      updatedDestination.category = categoryId;
      await updatedDestination.save();

      category.destinations.push(updatedDestination._id);
      await category.save();
    }

    res.status(200).json({
      message: "Destination updated successfully",
      data: updatedDestination,
    });
  } catch (error) {
    console.error("Error updating destination:", error.message);
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete a destination by name
export const deleteDestination = async (req, res) => {
  const { name } = req.params;

  try {
    const deletedDestination = await Destination.findOneAndDelete({ name });

    if (!deletedDestination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    res.status(200).json({
      message: "Destination deleted successfully",
      data: deletedDestination,
    });
  } catch (error) {
    console.error("Error deleting destination:", error.message);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all destinations
export const getAllDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find();

    if (destinations.length === 0) {
      return res.status(404).json({ message: "No destinations found" });
    }

    const destinationsWithUrls = await Promise.all(
      destinations.map(async (destination) => {
        destination = destination.toObject();
        if (destination.image) {
          try {
            destination.image = await getImageURL(destination.image);
          } catch (error) {
            console.warn(
              `Failed to generate URL for destination ${pkg._id}:`,
              error
            );
            destination.image = null;
          }
        }
        if (destination.gallery && destination.gallery.length > 0) {
          destination.gallery = await Promise.all(
            destination.gallery.map((image) => getImageURL(image))
          );
        }
        return destination;
      })
    );

    res.status(200).json({ data: destinationsWithUrls });
  } catch (error) {
    console.error("Error retrieving destinations:", error.message);
    res.status(500).json({ message: "Server error", error });
  }
};
