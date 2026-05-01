const oauthService = require('../services/oauthService');
const { generateToken } = require('../utils/jwt');
const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

exports.googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code missing from IdP.' });
    }

    const user = await oauthService.handleGoogleCallback(code);
    const internalToken = generateToken(user);

    res.status(200).json({
      message: 'Authentication successful',
      token: internalToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        role: user.role
      }
    });

  } catch (error) {
    res.status(502).json({ 
      message: 'Identity Provider authentication failed. Please try standard login or try again later.' 
    });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    // 1. Generate a random verification token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    // 2. Create the user as UNVERIFIED
    const user = await User.create({
      email,
      passwordHash: password, 
      firstName,
      lastName,
      authProvider: 'local',
      emailStatus: 'UNVERIFIED',
      verificationToken: hashedToken,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, 
    });

    // 3. Send the Verification Email
    const verificationUrl = `${process.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/verify/${rawToken}`;
    const message = `Welcome to Coloured Corners! \n\nPlease verify your email by clicking this link: \n${verificationUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Verify your Coloured Corners Account',
        message: message,
      });
      console.log(`\n📧 TEST MODE: Verification Link for ${user.email}:\n${verificationUrl}\n`);
    } catch (err) {
      console.error('Email failed to send:', err);
    }

    res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account before logging in.',
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

    if (user.authProvider !== 'local' && !user.passwordHash) {
      return res.status(400).json({ message: `Please login using your ${user.authProvider} account.` });
    }

    // --- THE GATEKEEPER ---
    if (user.emailStatus !== 'VERIFIED') {
      return res.status(403).json({ message: 'Please verify your email address before logging in.' });
    }

    const isValid = await user.isValidPassword(password);
    if (!isValid) return res.status(401).json({ message: 'Invalid email or password.' });

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, firstName: user.firstName, role: user.role }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({ 
      where: { verificationToken: hashedToken } 
    });

    if (!user || user.verificationTokenExpires < Date.now()) {
      return res.status(400).json({ message: 'Token is invalid or has expired.' });
    }

    user.emailStatus = 'VERIFIED';
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required to resend verification.' });

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });

    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.emailStatus === 'VERIFIED') return res.status(400).json({ message: 'This account is already verified. Please log in.' });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.verificationToken = hashedToken;
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const verificationUrl = `${process.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/verify/${rawToken}`;
    const message = `Welcome to Coloured Corners! \n\nPlease verify your email by clicking this link: \n${verificationUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Verify your Coloured Corners Account (Resend)',
        message: message,
      });
    } catch (err) {
      return res.status(500).json({ message: 'Failed to send the email. Please try again later.' });
    }

    res.status(200).json({ message: 'Verification email resent successfully! Check your inbox.' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Please provide an email address.' });

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });

    if (!user) return res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 1 * 60 * 60 * 1000; 
    await user.save();

    const resetUrl = `${process.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/reset-password/${rawToken}`;
    const message = `You are receiving this email because you requested a password reset.\n\nClick below to set a new password:\n${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request - Coloured Corners',
        message: message,
      });
    } catch (err) {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      return res.status(500).json({ message: 'Failed to send the password reset email.' });
    }

    res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters long.' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({ where: { resetPasswordToken: hashedToken } });

    if (!user || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    user.passwordHash = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};