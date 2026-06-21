const oauthService = require('../services/oauthService');
const { generateToken } = require('../utils/jwt');
const { User, Cart, CartItem } = require('../models');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

exports.googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send('Authorization code missing from IdP.');
    }

    const user = await oauthService.handleGoogleCallback(code);
    const internalToken = generateToken(user);

    // --- THE FIX: We MUST redirect back to the React frontend, NOT send JSON! ---
    const frontendUrl = process.env.VITE_FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/oauth-success?token=${internalToken}`);

  } catch (error) {
    console.error('OAuth Error:', error);
    // If it fails, bounce them back to sign in
    const frontendUrl = process.env.VITE_FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/signin?error=oauth_failed`);
  }
};

exports.register = async (req, res) => {
  try {
    // <-- NEW: Extract 'role' from req.body
    const { email, password, firstName, lastName, role } = req.body;

    const existingUser = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    // <-- NEW: Validate the role so hackers can't inject garbage data like "SUPER_HACKER"
    const validRoles = ['CUSTOMER', 'SELLER'];
    const assignedRole = validRoles.includes(role) ? role : 'CUSTOMER';

    // 1. Generate a random verification token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    // 2. Create the user with their assigned role
    const user = await User.create({
      email,
      passwordHash: password, 
      firstName,
      lastName,
      role: assignedRole, // <-- NEW: Save it to the DB!
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
    const { email, password, guestId } = req.body; // <-- NEW: Catch the guestId from the frontend

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

    if (user.authProvider !== 'local' && !user.passwordHash) {
      return res.status(400).json({ message: `Please login using your ${user.authProvider} account.` });
    }

    if (user.emailStatus !== 'VERIFIED') {
      return res.status(403).json({ message: 'Please verify your email address before logging in.' });
    }

    const isValid = await user.isValidPassword(password);
    if (!isValid) return res.status(401).json({ message: 'Invalid email or password.' });
    
    // ==========================================
    // 🚧 DROP THE BAN GATE RIGHT HERE
    // ==========================================
    if (user.isSuspended) {
      return res.status(403).json({ 
        message: 'Your account has been suspended by an Administrator. Contact support.' 
      });
    }
    // ==

    // --- THE CART MERGE LOGIC (PHASE 4) ---
    if (guestId) {
      const guestCart = await Cart.findOne({ where: { guestId } });
      
      if (guestCart) {
        const userCart = await Cart.findOne({ where: { userId: user.id } });
        
        if (userCart) {
          // Both carts exist: Move guest items into the user's existing cart
          const guestItems = await CartItem.findAll({ where: { cartId: guestCart.id } });
          for (let item of guestItems) {
            const existingItem = await CartItem.findOne({ where: { cartId: userCart.id, productId: item.productId } });
            if (existingItem) {
              existingItem.quantity += item.quantity;
              await existingItem.save();
            } else {
              item.cartId = userCart.id;
              await item.save();
            }
          }
          await guestCart.destroy(); // Destroy the old guest cart
        } else {
          // Only the guest cart exists: Transfer ownership to the logged-in user
          guestCart.userId = user.id;
          guestCart.guestId = null;
          guestCart.expiresAt = null; // Remove the 7-day guest expiration!
          await guestCart.save();
        }
      }
    }
    // --------------------------------------

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

// --- ADD THIS TO THE BOTTOM OF authController.js ---
exports.updateRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    // We get req.user.id because this route will be protected by your middleware!
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Security check
    const validRoles = ['CUSTOMER', 'SELLER'];
    if (validRoles.includes(role)) {
      user.role = role;
      await user.save();
    }

    res.status(200).json({ message: 'Role updated successfully', role: user.role });
  } catch (error) {
    console.error('Update Role Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};