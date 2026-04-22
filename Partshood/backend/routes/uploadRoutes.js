const express = require('express');
const multer = require('multer'); // pulling in multer for handling multipart form data natively
const path = require('path');

const router = express.Router();

// configuring exactly where and how multer saves the images to the server hard drive
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // dump everything in the local uploads folder for now
  },
  filename(req, file, cb) {
    // stringing together the fieldname, a timestamp, and original extension so filenames don't clash
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// verifying they are actually sending an image and not a malicious script
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/; // only accepting these standard web formats
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true); // looks good
  } else {
    cb('Images only!'); // blocks the upload
  }
}

// initializing the actual upload middleware
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb); // triggering our security check above
  },
});

// the actual endpoint the frontend hits with the file
router.post('/', upload.single('image'), (req, res) => {
  // if we get here, multer already saved the file, so just spit back the path to the frontend 
  res.send({
    message: 'Image Uploaded successfully',
    image: `/${req.file.path.replace(/\\/g, '/')}`, // cleaning up windows file paths just in case
  });
});

module.exports = router;
