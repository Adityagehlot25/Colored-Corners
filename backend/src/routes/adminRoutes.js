const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const adminController = require('../controllers/adminController');

// The Bouncer: EVERY route below this line requires an existing Admin JWT
router.use(protect, authorizeRoles('ADMIN'));

// Platform Stats
router.get('/stats', adminController.getPlatformStats);

// User Management
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/suspend', adminController.toggleUserSuspension);
router.put('/elevate-user', adminController.elevateToAdmin);

// You can add your Audit Log routes here tonight!
// router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
