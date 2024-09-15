const express = require('express');
const { ApiRateLimiter } = require('../middlewares/Auth');
const { sendOtp, verifyOtp, registerAdmin, loginAdmin, sendLoginOtp } = require('../controllers/Auth.controller');
const sendMail = require('../mail');

const authRoutes = express.Router();
authRoutes.post("/send-otp", ApiRateLimiter, sendOtp)
authRoutes.post("/send-login-otp", ApiRateLimiter, sendLoginOtp)
authRoutes.post("/verify-otp", ApiRateLimiter, verifyOtp)
authRoutes.get("/mail/send", sendMail)
authRoutes.post("/admin/register", ApiRateLimiter, registerAdmin)
authRoutes.post("/admin/login", ApiRateLimiter, loginAdmin)
module.exports = authRoutes;