const { Router } = require("express");
const { authMiddleware, isAdmin } = require("../middlewares/Auth");
const { uploadImages } = require("../controllers/FileUoload.controller");

const appRouter = Router();


appRouter.route('/upload').post(uploadImages);
module.exports = appRouter;