const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadImage');

// 📌 Avtomatik rasm yuklash route
router.post('/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.status(200).json({
    path: `/uploads/products/${req.file.filename}`,
    message: 'Image uploaded successfully',
  });
});

module.exports = router;