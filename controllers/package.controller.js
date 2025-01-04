import { Package } from "../models/package.model.js";
import { uploadImageInBucket, getImageURL } from "./image.controller.js";

// Get all packages with image URLs
export const getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find();
    if (packages.length === 0) {
      return res.status(200).json({ message: "No Packages Found" });
    }

    const packagesWithUrls = await Promise.all(
      packages.map(async (pkg) => {
        pkg = pkg.toObject();

        if (pkg.image) {
          try {
            pkg.image = await getImageURL(pkg.image);
          } catch (error) {
            console.warn(
              `Failed to generate URL for package ${pkg._id}:`,
              error
            );
            pkg.image = null;
          }
        }
        return pkg;
      })
    );

    res.status(200).json(packagesWithUrls);
  } catch (error) {
    console.error("Failed to fetch packages:", error);
    res.status(500).json({ message: "Failed to fetch packages", error });
  }
};

// Get a single package with image URL
export const getPackage = async (req, res) => {
  const { id } = req.params;
  try {
    const tourPackage = await Package.findById(id);
    if (!tourPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    // Attach signed URL for the image
    const packageWithUrl = tourPackage.toObject(); // Convert mongoose document to plain object
    if (packageWithUrl.imgSrc) {
      packageWithUrl.imgUrl = await getImageURL(packageWithUrl.imgSrc);
    }

    res.status(200).json(packageWithUrl);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch package", error });
  }
};

// Get a package by packageId
export const getPackageByPackageId = async (req, res) => {
  const { packageId } = req.params;

  try {
    // Find package by packageId
    const tourPackage = await Package.findOne({ packageId });

    if (!tourPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    // Attach signed URLs for images
    const packageWithUrls = tourPackage.toObject(); // Convert mongoose document to plain object
    if (packageWithUrls.image && packageWithUrls.image.length > 0) {
      try {
        packageWithUrls.image = await Promise.all(
          packageWithUrls.image.map(async (img) => await getImageURL(img))
        );
      } catch (error) {
        console.warn(
          `Failed to generate URLs for package ${tourPackage._id}:`,
          error
        );
        packageWithUrls.image = [];
      }
    }

    res.status(200).json(packageWithUrls);
  } catch (error) {
    console.error("Failed to fetch package by packageId:", error);
    res.status(500).json({ message: "Failed to fetch package", error });
  }
};

// Create a new package with image upload
export const createPackage = async (req, res) => {
  try {
    const packageData = {
      ...req.body,
      duration: {
        days: req.body.days,
        nights: req.body.nights,
      },
    };

    if (typeof req.body.location === "string") {
      packageData.location = JSON.parse(req.body.location);
    }

    // Parse languages if needed
    if (typeof req.body.languages === "string") {
      packageData.languages = JSON.parse(req.body.languages);
    }

    // Handle image upload
    if (req.file) {
      const imgName = await uploadImageInBucket(
        req.file.buffer,
        req.file.mimetype
      );
      console.log("Image Uploaded Controller");
      packageData.image = imgName; // Store the image name in the package data
    } else {
      console.log("No file found");
    }

    const newPackage = new Package(packageData);
    await newPackage.save();
    res.status(201).json(newPackage);
  } catch (error) {
    console.log("Failed to create package: ", error);
    res.status(400).json({ message: "Failed to create package", error });
  }
};

// Update a package with image upload
export const updatePackage = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    // Handle image upload if a new image is provided
    if (req.file) {
      const imgName = await uploadImageInBucket(
        req.file.buffer,
        req.file.mimetype
      );
      updatedData.imgSrc = imgName;
    }

    const updatedPackage = await Package.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });
    if (!updatedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.status(200).json(updatedPackage);
  } catch (error) {
    res.status(400).json({ message: "Failed to update package", error });
  }
};

export const deletePackage = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedPackage = await Package.findByIdAndDelete(id);
    if (!deletedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }
    res.status(200).json({ message: "Package deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete package", error });
  }
};
