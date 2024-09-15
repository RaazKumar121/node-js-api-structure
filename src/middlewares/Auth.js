const User = require('../models/User.model')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const RateLimit = require('express-rate-limit');
const Admin = require('../models/Admin.model');
const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;
    try {
        if (req?.headers?.authorization?.startsWith('Bearer') || req.cookies.token) {
            token = req.headers?.authorization?.split(" ")[1] || req.cookies.token;
            try {

                if (token) {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET)
                    const user = await User.findById(decoded?.id);
                    if (user && user.status === 1) {
                        req.user = user;
                    } else {
                        res.status(500).json({ success: false, message: "Your Account is not activated or blocked" });

                        // throw new Error('Your Account is not activated or blocked');
                    }
                    next();
                } else {
                    res.status(500).json({ success: false, message: "Not Authorized token expired , please login again" });

                }
            } catch (error) {
                res.status(500).json({ success: false, message: "Not Authorized token expired , please login again" });

                // throw new Error("Not Authorized token expired , please login again")
            }
        } else {
            res.status(500).json({ success: false, message: "there was no authorization token available" });

            // throw new Error("there was no authorization token available")

        }
    } catch (error) {
        res.status(500).json({ success: false, message: "there was no authorization token available" });

    }

})

const isAdmin = asyncHandler(async (req, res, next) => {
    let token;
    try {
        if (req?.headers?.authorization?.startsWith('Bearer') || req.cookies.token) {
            token = req.headers?.authorization?.split(" ")[1] || req.cookies.token;
            try {

                if (token) {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET)
                    const user = await Admin.findById(decoded?.id);
                    if (user && user.status === 1) {
                        req.user = user;
                    } else {
                        res.status(500).json({ success: false, message: "Your Account is not activated or blocked" });

                        // throw new Error('Your Account is not activated or blocked');
                    }
                    next();
                } else {
                    res.status(500).json({ success: false, message: "Not Authorized token expired , please login again" });

                }
            } catch (error) {
                res.status(500).json({ success: false, message: "Not Authorized token expired , please login again" });

                // throw new Error("Not Authorized token expired , please login again")
            }
        } else {
            res.status(500).json({ success: false, message: "there was no authorization token available" });

            // throw new Error("there was no authorization token available")

        }
    } catch (error) {
        res.status(500).json({ success: false, message: "there was no authorization token available" });

    }


})
const ApiRateLimiter = asyncHandler(RateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    limit: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Use an external store for consistency across multiple server instances.
}))


module.exports = { authMiddleware, ApiRateLimiter, isAdmin };