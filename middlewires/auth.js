import jwt from "jsonwebtoken";

const verifyUser = (req, res, next) => {
  //const token = req.cookies.token; //  read from cookie
let token;
 if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }
 else if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return res.json({msg:"unauthorized access denied"});   
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userid; //decoded ={userid:User._id}
    console.log(`${req.userId}`)
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};
export default verifyUser