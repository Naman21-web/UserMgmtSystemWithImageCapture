const express = require('express');
const router = express.Router();
const {
  uploadImage,
  getImages,
  serveImage,
  deleteImage,
} = require('../controllers/imageController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.post('/upload', upload.single('image'), uploadImage);
router.get('/', getImages);
router.get('/file/:filename', serveImage);
router.delete('/:id', deleteImage);

module.exports = router;
