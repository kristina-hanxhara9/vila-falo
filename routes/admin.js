const express = require('express');
const router = express.Router();
const { adminLogin, getAdminDashboard } = require('../controllers/adminController');

// Admin login route
router.post('/login', adminLogin);

// Admin dashboard route
router.get('/dashboard', getAdminDashboard);

module.exports = router;
