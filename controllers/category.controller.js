import { Category } from "../models/category.model.js";
import { Destination } from "../models/destination.model.js";

// Create a new category
export const createCategory = async (req, res) => {
  const { name, description, destinations } = req.body;

  try {
    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    // Validate that all provided destination IDs are valid
    if (destinations && destinations.length > 0) {
      // Find all the destinations with the provided IDs
      const validDestinations = await Destination.find({ '_id': { $in: destinations } });

      // If the number of valid destinations is different from the provided ones, some are invalid
      if (validDestinations.length !== destinations.length) {
        return res.status(400).json({ message: "Some destination IDs are invalid." });
      }
    }

    // Create a new category with the provided data
    const newCategory = new Category({
      name,
      description,
      destinations: destinations || [],  // Use the provided destinations
    });

    // Save the category
    await newCategory.save();

    // Respond with the created category
    res.status(201).json({
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error.message);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get a category by name
export const getCategoryByName = async (req, res) => {
  const { name } = req.params;

  try {
    const category = await Category.findOne({
      name: { $regex: new RegExp("^" + name + "$", "i") },
    }).populate("destinations");

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ data: category });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("destinations");

    if (categories.length === 0) {
      return res.status(404).json({ message: "No categories found" });
    }

    res.status(200).json({ data: categories });
  } catch (error) {
    console.error("Error retrieving categories:", error.message);
    res.status(500).json({ message: "Server error", error });
  }
};

// Update a category (with validation for destination IDs)
export const updateCategory = async (req, res) => {
  const { id } = req.params;  // Now using the `id` parameter
  const { description, destinations } = req.body;

  try {
    // Find the category by its _id (not by name)
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Validate that all provided destination IDs are valid
    if (destinations && destinations.length > 0) {
      const validDestinations = await Destination.find({ '_id': { $in: destinations } });

      if (validDestinations.length !== destinations.length) {
        return res.status(400).json({ message: "Some destination IDs are invalid." });
      }

      category.destinations = destinations;
    }

    category.description = description || category.description;

    // Save the updated category
    await category.save();

    res.status(200).json({
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error updating category:", error.message);
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete a category by _id
export const deleteCategory = async (req, res) => {
  const { id } = req.params;  // 'id' in the route, which refers to _id in the DB

  try {
    // Use _id to find and delete the category
    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Category deleted successfully",
      data: deletedCategory,
    });
  } catch (error) {
    console.error("Error deleting category:", error.message);
    res.status(500).json({ message: "Server error", error });
  }
};