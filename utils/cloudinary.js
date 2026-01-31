import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const upload = async (localFilePath) => {
    if(!localFilePath) return null
  try {
    const store = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
       folder: "profile-pics"
    });
     console.log(store)
    console.log(store?.secure_url)
     fs.unlinkSync(localFilePath);
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
