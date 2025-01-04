import express from "express";
import multer from "multer";
import { packageController } from "../controllers/controller.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", packageController.getAllPackages);
router.get("/:packageId", packageController.getPackageByPackageId);
// router.get("/:id", packageController.getPackage);
router.post("/", upload.single("image"), packageController.createPackage);
router.put("/:id", packageController.updatePackage);
router.delete("/:id", packageController.deletePackage);

export default router;
