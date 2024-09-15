const asyncHandler = require("express-async-handler");
const multer = require("multer");
const fs = require('fs');
const slugify = require("slugify");

const FOLDER_NAME = `/images/`;
const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        if (!fs.existsSync(`${process.env.IMAGE_UPLOAD_PATH}${FOLDER_NAME}`)) {
            // If the folder doesn't exist, create it
            fs.mkdirSync(`${process.env.IMAGE_UPLOAD_PATH}${FOLDER_NAME}`, { recursive: true });
        }
        cb(null, `${process.env.IMAGE_UPLOAD_PATH}${FOLDER_NAME}`); // File uploads will be stored in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + slugify(file.originalname));
    },
});
const fileFilter = function (req, file, cb) {
    if (['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime'].includes(file.mimetype)) {
        cb(null, true); // Accept file
    } else {
        cb(new Error('Only images and videos are allowed!'), false); // Reject file
    }
};

const multiUploads = multer({ storage, fileFilter }).fields([
    { name: "images" },
]);



exports.uploadImages = asyncHandler(async (req, res) => {
    try {
        multiUploads(req, res, async (err) => {
            try {
                let images;
                if (req.files && req.files.images) {
                    images = req.files.images.map((file) => `${process.env.IMAGE_PUBLIC_URL}${FOLDER_NAME}${slugify(file.filename)}`);
                }

                res.json({ images });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });

    }
});
