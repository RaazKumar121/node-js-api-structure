const { default: mongoose } = require("mongoose");

const OtpSchema = new mongoose.Schema({
  email: String,
  otp: Number,
  createdAt: { type: Date, expires: 60, default: Date.now } // OTP expires after 60 seconds
});

const Otp = mongoose.models.otps || mongoose.model("otps", OtpSchema);

module.exports = Otp;
