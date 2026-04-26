const axios = require('axios');
const User = require('../models/User');

class OAuthService {
  /**
   * Exchanges the auth code for an access token, fetches profile data, 
   * and provisions/links the user.
   */
  async handleGoogleCallback(authCode) {
    try {
      // 1. Exchange the authorization code for an external Access Token
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: authCode,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      });

      const { access_token } = tokenResponse.data;

      // 2. Fetch user profile data from Google
      const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const { id: oauthId, email, given_name, family_name, verified_email } = profileResponse.data;

      if (!verified_email) {
        throw new Error('Email scope denied or unverified by IdP.');
      }

      // 3. Check for existing user or Provision a new one
      let user = await User.findOne({ where: { email } });

      if (user) {
        // Alternate Flow: Account exists, link the OAuth provider if not already linked
        if (!user.oauthId) {
          user.oauthId = oauthId;
          user.authProvider = 'google';
          user.emailStatus = 'VERIFIED'; // We trust the IdP's verification
          await user.save();
        }
      } else {
        // Main Flow: Provision a new user record.
        // Notice we are NOT passing a passwordHash, enforcing BR-AUTH-02.
        user = await User.create({
          email,
          firstName: given_name,
          lastName: family_name,
          authProvider: 'google',
          oauthId: oauthId,
          emailStatus: 'VERIFIED', 
          role: 'CUSTOMER'
        });
      }

      return user;

    } catch (error) {
      console.error('OAuth Service Error:', error.message);
      throw error; // Will be caught by the controller
    }
  }
}

module.exports = new OAuthService();