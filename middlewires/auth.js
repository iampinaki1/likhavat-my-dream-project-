import jwt from "jsonwebtoken";

const verifyUser = (req, res, next) => {
  //const token = req.cookies.token; //  read from cookie
let token;
 if (req.cookies?.token) {
    token = req.cookies.token;
    
  }
 else if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  console.log(`${token}`)
  if (!token) {
    return res.json({msg:"unauthorized access denied"});   
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_ACCESS);
    req.userId = decoded.userid; //decoded ={userid:User._id}
    console.log(`middlewire check:${req.userId}`)
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};
export default verifyUser