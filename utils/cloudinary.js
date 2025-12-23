import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
dotenv.config();
cloudinary.config({
  cloud_name: process.env.cloudName,
  api_key: process.env.apiKey,
  api_secret: process.env.apiSecret,
});
const upload = async (localFilePath) => {
    if(!localFilePath) return null
  try {
    const store = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
       folder: "profile-pics"
    });
    return store.secure_url;
  } catch (err) {
    fs.unlinkSync(localFilePath);
    return null
  }  
};

export default upload;
//Frontend → Multer (disk) → Local file saved
        // → Cloudinary upload
        // → Local file deleted
        // → Cloudinary URL saved in MongoDB
