const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// The endpoint the frontend redirects the user to (normally handled by frontend directly, but good for SSR)
router.get('/google/login', (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=profile email`;
  res.redirect(url);
});

// The callback endpoint the IdP hits after user grants permission
router.get('/google/callback', authController.googleCallback);
router.get('/verify-email/:token', authController.verifyEmail);

// Local authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
// Add this under your other local auth routes
router.post('/resend-verification', authController.resendVerification);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;