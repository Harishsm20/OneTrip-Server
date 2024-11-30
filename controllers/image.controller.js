import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

// Environment variables
const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

// Initialize S3 Client
const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

// Generate a random image name
const randomImgName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

export const uploadImageInBucket = async (fileBuffer, mimeType) => {
  try {
    const imgName = `${randomImgName()}`; // Generate a unique name for the image
    const params = {
      Bucket: bucketName,
      Key: imgName,
      Body: fileBuffer,
      ContentType: mimeType,
    };

    console.log("before upload");

    const command = new PutObjectCommand(params);
    await s3.send(command);
    console.log("after upload");

    console.log("Image uploaded successfully:", imgName);
    return imgName;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
};

export const getImageURL = async (imgName) => {
  try {
    // Ensure imgName is a string, not an array
    if (Array.isArray(imgName)) {
      imgName = imgName[0]; // Get the first element if imgName is an array
    }

    if (!imgName) {
      throw new Error("Image name is missing or undefined");
    }

    console.log("Generating signed URL for image:", imgName);

    const getObjectParams = {
      Bucket: bucketName,
      Key: imgName,
    };

    console.log("GetObject parameters:", getObjectParams);

    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL valid for 1 hour

    console.log("Generated signed URL:", url);
    return url;
  } catch (error) {
    console.error("Error generating signed URL for image:", imgName, error);
    throw new Error("Failed to generate signed URL");
  }
};

/**
 * Example usage:
 * Uncomment below lines to test the upload and get URL functionality.
 */

// Example: Upload an image
// const filePath = "./example-image.jpg";
// const fileBuffer = fs.readFileSync(filePath);
// const mimeType = "image/jpeg";
// uploadImageInBucket(fileBuffer, mimeType).then((imgName) => {
//   // Example: Get signed URL for the uploaded image
//   getImageURL(imgName).then((url) => {
//     console.log("Image URL:", url);
//   });
// });