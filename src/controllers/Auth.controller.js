const asyncHandler = require("express-async-handler");
const Otp = require("../models/Otp.model");
const User = require("../models/User.model");
const { generateToken } = require("../helpers/generateToken");
const { USER_STATUS } = require("../constants");
const sendMail = require("../mail/index");
const Admin = require("../models/Admin.model");
const { generateRefreshToken } = require("../config/refreshtoken");
const sendOtp = asyncHandler(async (req, res) => {
  try {
    // console.log(req.body);
    const { email, referer_code } = req.body;
    if (email) {
      let referer_id;
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser.status == USER_STATUS.ACTIVE) {
        return res.json({ success: false, message: "email already exist" });
      }
      const existingOTP = await Otp.findOne({ email });
      if (existingOTP) {
        return res
          .status(200)
          .json({ success: false, message: "Email address already requested OTP" });
      }
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const newOTP = new Otp({
        email,
        otp,
      });

      await newOTP.save();
      sendMail({ email, otp, isOtp: true })

      if (!existingUser) {

        const { name, email, mobile, referer_code } = req.body;
        if (referer_code) {
          const referer = await User.findOne({ refercode: referer_code });
          referer_id = referer.id;
        }

        const user = new User({
          name, email, mobile, referer_id, referer_code, refercode: 'A1A1A1'
        })
        await user.save();
      }
      return res.json({ success: true, message: "OTP sent successfully" });
    } else {
      return res.status(200).json({ success: false, message: "Please fill your email" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message || "Failed to send OTP" });
  }
});

const verifyOtp = asyncHandler(async (req, res) => {

  try {
    const { otp } = req.body;
    console.log(req.body);

    if (otp) {
      const existingOTP = await Otp.findOne({ otp });

      if (existingOTP) {
        // 
        const alredy = await User.findOne({ email: existingOTP.email });
        if (alredy) {
          await Otp.findByIdAndDelete(existingOTP._id);
          await User.findByIdAndUpdate(alredy.id, { status: USER_STATUS.ACTIVE })
          const token = generateToken(alredy?.id || alredy?._id);
          return res.json({
            success: true, message: 'login success', token
          });
        } else {
          return res.status(200).json({ success: false, message: 'Email does not exist' });
        }
      }

      return res.status(200).json({ success: false, message: 'Invalid OTP' });



    } else {
      return res.status(200).json({ success: false, message: "Please fill otp" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message || "server error, Try again!" });

  }



});
const sendLoginOtp = asyncHandler(async (req, res) => {
  try {
    console.log(req.body);
    const { email } = req.body;
    if (email) {
      const existingUser = await User.findOne({ email, status: USER_STATUS.ACTIVE });
      if (!existingUser) {
        return res.json({ success: false, message: "email does not found" });
      }
      const existingOTP = await Otp.findOne({ email });
      if (existingOTP) {
        return res
          .status(200)
          .json({ success: false, message: "Email address already requested OTP" });
      }
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const newOTP = new Otp({
        email,
        otp,
      });

      await newOTP.save();
      sendMail({ email, otp, isOtp: true })
      return res.json({ success: true, message: "OTP sent successfully", otp });
    } else {
      return res.status(200).json({ success: false, message: "Please fill your email" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message || "Failed to send OTP" });
  }
});

const registerAdmin = asyncHandler(async (req, res) => {
  /**
   * TODO:Get the email from req.body
   */
  const email = req.body.email;
  /**
   * TODO:With the help of email find the Admin exists or not
   */
  const findAdmin = await Admin.findOne({ email: email });
  const refreshToken = await generateRefreshToken(findAdmin?._id);
  if (!findAdmin) {
    /**
     * TODO:if Admin not found Admin create a new Admin
     */
    const newAdmin = await Admin.create(req.body);
    res.cookie("token", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      message: "Register Success",
      status: 1,
      data: newAdmin,
      token: refreshToken,
    });
  } else {
    /**
     * TODO:if Admin found then thow an error: Admin already exists
     */
    throw new Error("Admin Already Exists");
  }
});


const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if Admin exists or not
  const findAdmin = await Admin.findOne({ email });
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    const updateAdmin = await Admin.findByIdAndUpdate(
      findAdmin.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    ).select("-password");
    res.cookie("token", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    // res.json({
    //   _id: findAdmin?._id,
    //   firstname: findAdmin?.firstname,
    //   lastname: findAdmin?.lastname,
    //   email: findAdmin?.email,
    //   mobile: findAdmin?.mobile,
    //   token: generateToken(findAdmin?._id),
    // });
    res.json({
      message: "Login Success",
      status: 1,
      data: updateAdmin,
      token: generateToken(findAdmin?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});


module.exports = { sendOtp, verifyOtp, registerAdmin, loginAdmin, sendLoginOtp }
