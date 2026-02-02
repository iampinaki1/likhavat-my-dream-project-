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
        html: `<h1>Your verification code is here</h1> <p>CODE: ${verificationCode} (expire within 2 min</P>`,
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
  const { userId, isprivate } = req.body;
  const localFilePath = req.file.path;
  console.log(localFilePath);
  const imageUrl = await upload(localFilePath);
  console.log(imageUrl);
  try {
    if (imageUrl) {
      //
    }
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          profilepic: imageUrl,
          // bio:bio
        },
        $set: {
          profilepic: imageUrl,
          isPrivate: isprivate,
          // bio: bio
        },
      },
      { new: true },
    );
    return res.json({
      msg: "Photo uploaded successfully",
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
      html: `<h1>Your verification code for reset password is here</h1> <p>CODE: ${verificationCode} (expire within 2 min</P>`,
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
    const user = await User.findOne({
      $or: [{ username: email_username }, { email: email_username }],
    });
    if (!email_username)
      return res.status(400).json({ msg: "first create id" });
    console.log(password, user?.password);
    const check = await bcrypt.compare(password, user.password);
    if (!check) {
      return res.status(400).json({ msg: "wrong credencials" });
    }
    const html = "<P>thx for logining again</P>";
    await sendmail({
      to: user.email,
      subject: "WELCOME BACK",
      html,
    });
    const payload = { userid: user._id };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "4d" },
      (err, token) => {
        if (err) throw err;

        // Set JWT in cookie
        res.cookie("token", token, {
          httpOnly: true, // prevents JS access matlab //cookie cannot be accessed by JavaScript i.e (document.cookie).
          secure: process.env.NODE_ENV === "production", // true in production (HTTPS)
          //secure: true → cookie only sent over HTTPS, not HTTP.
          //The condition process.env.NODE_ENV === "production" ensures:
          //When you’re in production (live site), cookies only work over HTTPS.
          //But during development (localhost), you can still test with HTTP.
          sameSite: "strict", // prevent CSRF
          maxAge: 4 * 24 * 60 * 60 * 1000, // 4 days set using millisecond conversion
        });
        return res.status(200).json({ msg: "login successful" });
        // return res.redirect("/home");//handle manually from front end cors may be there
      },
    );
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

const requestRecieved = async (req, res) => {
  const requests = await FollowRequest.find({
    receiver: req.params.username,
    status: "pending",
  }).populate("sender");

  res.json(requests);
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
          status: "pending", ///default pending he model me no need still u can write
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
};
