import multer from "multer";
import path from 'path'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {//this file is going to be used req.file
    cb(null, "../public/my-uploads")
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix+ path.extname(file.originalname))
  }
})

//export default  upload = multer({ storage }) //wrong way
//You are trying to declare a variable and export it at the same time using assignment — and JavaScript does NOT allow that.
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only images allowed"), false);
};//only images
const upload = multer({ storage ,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});
export default upload;
//same as storage: storage as name is same 