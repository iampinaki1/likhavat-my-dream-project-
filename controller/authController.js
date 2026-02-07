import User from "../models/user.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendmail } from "../utils/mailer.js";
import TempUser from "../models/tempuser.models.js";
import FollowRequest from "../models/followerRequest.models.js";
import upload from "../utils/cloudinary.js";
import mongoose from "mongoose";
dotenv.config();

// //signup controller
async function signup(req, res) {
  const { username, email, password, termAndCondition } = req.body;
  try {
    if (termAndCondition === true) {
      const user = await User.findOne({ email });
      //console.log(req.body);
      // console.log("EMAIL:", email);
      if (user) {
        const check = await bcrypt.compare(password, user.password);
        if (!check || user.username != username) {
          return res.status(400).json({
            msg: "email already exists and password or username is wrong",
          });
        }
        return res
          .status(400)
          .json({ msg: "user already exist try to login test" });
      }
      if (await User.findOne({ username })) {
        return res.json({ msg: "userid already taken" });
      }
      const verificationCode = Math.floor(1000 + Math.random() * 9000);
      const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      //const passwordd = Password;
      //newUser = new TempUser({
      const newUser = new TempUser({
        username,
        email,
        password: hashedPassword,
        verificationCode,
        verificationCodeExpiry,
      });

      // await TempUser.Save(); learn
      await newUser.save();
      await sendmail({
        to: email,
        subject: "welcome to my project",
        html: ` 
  <h1 style="font-family: Arial, sans-serif; color: #202124;">
    Your verification code for SIGN UP
  </h1>

  <p style="font-family: Arial, sans-serif; font-size: 14px; color: #202124;">
    <strong>Code:</strong> ${verificationCode}
  </p>

  <p style="font-family: Arial, sans-serif; font-size: 12px; color: #5f6368;">
    This code will expire in 2 minutes.
  </p>
`,
      });
      return res.status(201).json({
        msg: "verification code has sent ...redirecting to verification page",
        tempUserId: newUser._id,
      }); //can i use User ir tempUser or it will clash with my code
    } else {
      res.status(500).json({ click: "term and condition should be agreed" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
}

//verify_signup controller
async function verify_signup(req, res) {
  const { tempUserId, verificationCode } = req.body;
  try {
    const tempUser = await TempUser.findById(tempUserId);
    if (!tempUser) return res.status(400).json({ msg: "try again" });
    if (!tempUser.verificationCode || !tempUser.verificationCodeExpiry)
      return res.status(400).json({ msg: "try again" });
    if (new Date() > tempUser.verificationCodeExpiry)
      return res.status(400).json({ msg: "code expired" });
    if (tempUser.verificationCode !== verificationCode)
      return res.status(400).json({ msg: "invalid code" });
    const newUser = new User({
      username: tempUser.username,
      email: tempUser.email,
      password: tempUser.password,
      termAndCondition: true,
      isPrivate: true,
    });
    await newUser.save();
    await TempUser.findByIdAndDelete(tempUserId);
    return res.status(201).json({ msg: "User created successfully" });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: "Server error" });
  }
}
async function updateProfile(req, res) {
  const { username, isPrivate } = req.body;
  const userId = req.userId;
  const localFilePath = req.file.path;
  console.log(localFilePath);
  const imageUrl = await upload(localFilePath);
  console.log(imageUrl);
  const details = {};
  if (username) {
    details.username = username;
  }
  if (isPrivate !== undefined) {
    details.isPrivate = isPrivate;
  }
  if (imageUrl) {
    details.profilePic = imageUrl;
  }
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: details,
      },
      { new: true },
    );
    return res.json({
      msg: "Details uploaded successfully",
      profilePic: user.profilepic,
    });
  } catch (err) {
    res.json({ msg: `err${err}` });
  }
}
//change password
async function changePassword(req, res) {
  try {
    const { email, _id, newpassword } = req.body;
    let user;
    if (!_id) {
      user = await User.findOne({ email });
    }
    if (!email) {
      user = await User.findById(_id);
    }
    if (!user) return res.status(400).json({ msg: "not registered" });

    const verificationCode = Math.floor(1000 + Math.random() * 9000);
    const verificationCodeExpiry = new Date(Data.now() + 2 * 60 * 1000);
    user = new TempUser({
      username: User.username,
      email: User.email,
      password: newpassword,
      verificationCode,
      verificationCodeExpiry,
    });

    await TempUser.Save();
    await sendmail({
      to: email,
      subject: "welcome to my project todolist",
      html:  `
  <h1 style="font-family: Arial, sans-serif; color: #202124;">
    Your verification code for resetting your password
  </h1>

  <p style="font-family: Arial, sans-serif; font-size: 14px; color: #202124;">
    <strong>Code:</strong> ${verificationCode}
  </p>

  <p style="font-family: Arial, sans-serif; font-size: 12px; color: #5f6368;">
    This code will expire in 2 minutes.
  </p>
`,
    });
    return res.status(201).json({
      msg: "verification code has sent ...redirecting to verification page",
      UserId: "User.username",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
}
//resetpassword bohi to upar likha bro

async function verify_newPassword(req, res) {
  const { username, verificationCode, newPassword } = req.body;
  try {
    const user = await User.findOne({ username });
    const tempUser = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "first create id" });
    if (!tempUser.verificationCode || !tempUser.verificationcodeExpiry)
      return res.status(400).json({ msg: "try again" });
    if (new Date() > tempUser.verificationcodeExpiry)
      return res.status(400).json({ msg: "code expired" });
    if (tempUser.verificationCode !== verificationCode)
      return res.status(400).json({ msg: "invalid code" });
    const salt = await bcrypt.genSalt(10);
    const Password = await bcrypt.hash(newPassword, salt);
    await User.findOneAndUpdate(
      username,
      {
        $set: {
          password: tempUser.password,
        },
      },
      { new: true },
    );
    await TempUser.deleteOne({ email });
    return Response.status(200).json({ msg: "password updated try to login" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
}

//signin
const signin = async (req, res) => {
  try {
    const { email_username, password } = req.body; //email or username
    if (!email_username || !password) {
      return res.status(400).json({ msg: "Missing credentials" });
    }
    const user = await User.findOne({
      $or: [{ username: email_username }, { email: email_username }],
    });
    if (!user) return res.status(400).json({ msg: "first create id" });
    console.log(password, user?.password);
    const check = await bcrypt.compare(password, user.password);
    if (!check) {
      return res.status(400).json({ msg: "wrong credencials" });
    }
    const payload = { userid: user._id };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET_ACCESS, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET_REFRESH, {
      expiresIn: "4d",
    });
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie("token", accessToken, {
      //access
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 4 * 24 * 60 * 60 * 1000,
    });
    const html = `
<p style="font-family: Arial, sans-serif; font-size: 14px; color: #202124;">
  Thanks for logging in again! We’re glad to have you back.
</p>
`;
    await sendmail({
      to: user.email,
      subject: "WELCOME BACK",
      html,
    });
    return res
      .status(200)
      .json({ msg: "login successful", accessToken, refreshToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const username = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username }).select("-password");
    if (user) {
      const follow = FollowRequest.findOne({
        receiver: username,
        sender: user.id,
      });

      return res.status(200).json(user, follow.status);
    }
    res.status(200).json({ search: "not found" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
}; //total all follwers following profile pic will be handlled by frontend

const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      sameSite: "strict", // prevent CSRF
      maxAge: 15 * 60 * 1000,
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      sameSite: "strict", // prevent CSRF
      maxAge: 4 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ msg: "logout successful" }); //redirect manually
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};
//delete account
const deleteUser = async (req, res) => {
  try {
    const userId = req.userId;
    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) res.status(200).json({ msg: "user deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//const getRandomUserSuggestion = async (req, res) => {};
// const requestRecieved= async(req, res) => {
//   console.log("DIRECT ROUTE HIT");
//   res.json({ ok: true });
// };

const requestRecieved = async (req, res) => {
  console.log("requestRecieved controller hit");
  console.log(`${req.userId}`);
  try {
    console.log("requestRecieved controller hit");
    const requests = await FollowRequest.find({
      receiver: new mongoose.Types.ObjectId(req.userId),
      status: "pending",
    }).populate({
      path: "sender",
      select: "-password",
    });
    console.log(`${req.userId}`);
    return res.json(requests);
  } catch (error) {
    console.log(`${error}`);
    return res.json({ msg: error });
  }
};
const acceptRequest = async (req, res) => {
  const { requestId } = req.body;

  const request = await FollowRequest.findById(requestId);

  await User.findByIdAndUpdate(request.receiver, {
    $push: { follower: request.sender },
  });

  await User.findByIdAndUpdate(request.sender, {
    $push: { following: request.receiver },
  });

  request.status = "accepted";
  await request.save();

  res.json({ msg: "Follow request accepted" });
};
const rejectRequest = async (req, res) => {
  const { requestId } = req.body;
  await FollowRequest.findByIdAndDelete(requestId);
  res.json({ msg: "Follow request rejected" });
};

const followUnfollow = async (req, res) => {
  try {
    const follower = req.userId;
    let followHim = req.params.username; //jisko follow karna he
    const userJiskoFollowKarnaHe = await User.findOne({ username: followHim });
    const user = await User.findById(follower);
    if (userJiskoFollowKarnaHe.username === user.username) {
      return res.status(400).json({ msg: "self follow not allowed" });
    }

    // const check = user.following.includes(userJiskoFollowKarnaHe._id);
    const check = user.following.some((id) =>
      id.equals(userJiskoFollowKarnaHe._id),
    );
    if (check)
      await Promise.all([
        User.updateOne(
          { username: user.username },
          { $pull: { following: userJiskoFollowKarnaHe._id } },
        ),
        User.updateOne(
          { username: followHim },
          { $pull: { followers: user._id } },
        ),
      ]);
    else {
      if (userJiskoFollowKarnaHe.isPrivate) {
        const requests = await FollowRequest.create({
          sender: user._id,
          receiver: userJiskoFollowKarnaHe._id,
          status: "pending", ///default pending  and it not needed also he model me no need still u can write
        });

        res.json(requests);
      } else {
        await Promise.all([
          User.updateOne(
            { username: user.username },
            { $push: { following: userJiskoFollowKarnaHe._id } },
          ),
          User.updateOne(
            { username: followHim },
            { $push: { followers: user._id } },
          ),
        ]);
        res.json({ msg: "Followed" });
      }
    }
  } catch (err) {
    return res.json({ msg: `error:${err}` });
  }
};
const refresh = async (req, res) => {
  try {
    const refreshToken =
      req.cookies?.refreshToken || req.headers["x-refresh-token"];

    if (!refreshToken) {
      return res.status(401).json({ msg: "No refresh token" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);

    const user = await User.findById(decoded.userid).select("+refreshToken");;
    console.log(`${user}  ${user.refreshToken}`)

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ msg: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      { userid: user._id },
      process.env.JWT_SECRET_ACCESS,
      { expiresIn: "15m" },
    );

    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    return res
      .status(200)
      .json({ msg: "Access token refreshed", accessToken: newAccessToken });
  } catch (err) {
    console.error(err);
    return res.status(403).json({ msg: "Refresh failed" });
  }
};

export {
  acceptRequest,
  rejectRequest,
  username,
  signup,
  verify_signup,
  verify_newPassword,
  changePassword,
  signin,
  logout,
  followUnfollow,
  deleteUser,
  updateProfile,
  requestRecieved,
  refresh,
};
