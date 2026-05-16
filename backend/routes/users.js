const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  resetUserPassword,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/', getAllUsers);
router.post('/', createUser);
router.get('/:id', getUserById);
router.put('/:id/role', updateUserRole);
router.put('/:id/status', toggleUserStatus);
router.put('/:id/password', resetUserPassword);
router.delete('/:id', deleteUser);

module.exports = router;
