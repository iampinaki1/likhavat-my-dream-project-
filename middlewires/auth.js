import jwt from "jsonwebtoken";

const verifyUser = (req, res, next) => {
  const token = req.cookies.token; //  read from cookie

  if (!token) {
    return res.redirect("/login");   //or /home
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userid; //decoded ={userid:User._id}
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};
export default verifyUser