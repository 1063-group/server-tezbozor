// middlewares/uploads/productUpload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/products');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const safeName = Date.now() + '-' + file.originalname.replace(/\s|\(|\)/g, '_');
    cb(null, safeName);
  },
});

const productFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only images are allowed'), false);
};

const productUpload = multer({ storage: productStorage, fileFilter: productFileFilter });

module.exports = productUpload;
