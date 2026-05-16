const path = require('path');
const fs = require('fs');
const Image = require('../models/Image');

// @desc    Upload / save captured image
// @route   POST /api/images/upload
// @access  Private (all roles)
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided.',
      });
    }

    const image = await Image.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      capturedBy: req.user.id,
      description: req.body.description || '',
    });

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully.',
      image: {
        id: image._id,
        filename: image.filename,
        originalName: image.originalName,
        size: image.size,
        description: image.description,
        url: `/api/images/file/${image.filename}`,
        capturedBy: req.user.username,
        createdAt: image.createdAt,
      },
    });
  } catch (error) {
    // Cleanup file on error
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
    next(error);
  }
};

// @desc    Get images (filtered by role)
// @route   GET /api/images
// @access  Private
const getImages = async (req, res, next) => {
  try {
    let filter = {};

    // Workers can only see their own images
    if (req.user.role === 'worker') {
      filter.capturedBy = req.user.id;
    }
    // Supervisors can see all images (or restrict to their team if needed)
    // Admins see all images

    const images = await Image.find(filter)
      .populate('capturedBy', 'username email role')
      .sort({ createdAt: -1 });

    const imagesWithUrls = images.map((img) => ({
      id: img._id,
      filename: img.filename,
      originalName: img.originalName,
      size: img.size,
      description: img.description,
      url: `/api/images/file/${img.filename}`,
      capturedBy: img.capturedBy,
      createdAt: img.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: images.length,
      images: imagesWithUrls,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Serve image file
// @route   GET /api/images/file/:filename
// @access  Private
const serveImage = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const imagePath = path.join(__dirname, '../uploads', filename);

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ success: false, message: 'Image file not found.' });
    }

    // Check access: workers can only access their own images
    if (req.user.role === 'worker') {
      const image = await Image.findOne({ filename });
      if (!image || image.capturedBy.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    res.sendFile(imagePath);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an image
// @route   DELETE /api/images/:id
// @access  Private (owner or admin)
const deleteImage = async (req, res, next) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found.' });
    }

    // Only owner or admin can delete
    if (
      image.capturedBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own images.',
      });
    }

    // Delete file from disk
    if (fs.existsSync(image.path)) {
      fs.unlinkSync(image.path);
    }

    await Image.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadImage, getImages, serveImage, deleteImage };
