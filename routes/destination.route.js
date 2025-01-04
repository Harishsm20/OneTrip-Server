import express from "express";
import multer from "multer";
import {
  getDestinationByName,
  updateDestination,
  createDestination,
  getAllDestinations,
  deleteDestination,
} from "../controllers/destination.controller.js";

const router = express.Router();

const storage = multer.memoryStorage(); // Store files in memory for easy access
const upload = multer({ storage }).fields([
  { name: "image", maxCount: 1 },
  { name: "gallery", maxCount: 10 },
]);

// In your route:
router.post("/create", upload, createDestination);

router.post("/single-page/", getDestinationByName);

router.get("/", getAllDestinations);

router.put("/:name", upload, updateDestination);

router.delete("/:name", deleteDestination);

export default router;
