import multer from "multer";
import path from"path"
const storage = multer.diskStorage({
  destination: function (req, file, cb) {//this file is going to be used req.file
    cb(null, "../public/my-uploads")
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

//export default  upload = multer({ storage }) //wrong way
//You are trying to declare a variable and export it at the same time using assignment — and JavaScript does NOT allow that.
const upload = multer({ storage });
export default upload;
//same as storage: storage as name is same 