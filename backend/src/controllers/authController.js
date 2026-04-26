const oauthService = require('../services/oauthService');
const { generateToken } = require('../utils/jwt');
const User = require('../models/User');

exports.googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code missing from IdP.' });
    }

    // Process the code, provision user, and get the local user record
    const user = await oauthService.handleGoogleCallback(code);

    // Generate our INTERNAL session token
    const internalToken = generateToken(user);

    // ENFORCING BR-AUTH-01: We NEVER return the Google access token to the client.
    // We only return our sanitized internal JWT.
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
    // Handling Exceptions: IdP Timeout/Failure or Scope Denied
    res.status(502).json({ 
      message: 'Identity Provider authentication failed. Please try standard login or try again later.' 
    });
  }
};

// --- NEW LOCAL AUTH CODE ---

exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    // 2. Create the user
    // We pass the raw password to passwordHash. The beforeCreate hook we wrote will hash it automatically!
    const user = await User.create({
      email,
      passwordHash: password, 
      firstName,
      lastName,
      authProvider: 'local'
    });

    // 3. Generate internal JWT
    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user.id, firstName: user.firstName, role: user.role }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user
    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' }); // Keep error vague for security
    }

    // 2. Check if they are trying to use a password on an OAuth-only account
    if (user.authProvider !== 'local' && !user.passwordHash) {
      return res.status(400).json({ message: `Please login using your ${user.authProvider} account.` });
    }

    // 3. Validate password using the instance method we wrote
    const isValid = await user.isValidPassword(password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // 4. Generate internal JWT
    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, firstName: user.firstName, role: user.role }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
};