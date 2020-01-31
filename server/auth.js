const auth = require('basic-auth');
const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const CLIENT_ID = process.env.REACT_APP_SHARETRIBE_SDK_CLIENT_ID;
const ROOT_URL = process.env.REACT_APP_CANONICAL_ROOT_URL;
const CONSOLE_URL =
  process.env.SERVER_SHARETRIBE_CONSOLE_URL || 'https://flex-console.sharetribe.com';

// Basic auth

/**
 * Create a basic authentication middleware function that checks
 * against the given credentials.
 */
exports.basicAuth = (username, password) => {
  if (!username || !password) {
    throw new Error('Missing required username and password for basic authentication.');
  }

  return (req, res, next) => {
    const user = auth(req);

    if (user && user.name === username && user.pass === password) {
      next();
    } else {
      res
        .set({ 'WWW-Authenticate': 'Basic realm="Authentication required"' })
        .status(401)
        .end("I'm afraid I cannot let you do that.");
    }
  };
};

// Initiate authorization code

/**
 * Makes a base64 string URL friendly by
 * replacing unaccepted characters.
 */
const urlifyBase64 = base64Str =>
  base64Str
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

/**
 * Generates a key for a cookie.
 */
const generateKey = (clientId, namespace, type) => `${namespace}-${clientId}-${type}`;

// Creates a 302 response that redirects to start an OAuth2 Authorization code
// login flow.
router.get('/initiate-login-as', (req, res) => {
  const userId = req.query.user_id;

  if (!userId) {
    return res.status(400).send('Missing query parameter: user_id.');
  }
  if (!ROOT_URL) {
    return res.status(409).send('Marketplace canonical root URL is missing.');
  }

  const state = urlifyBase64(crypto.randomBytes(32).toString('base64'));
  const codeVerifier = urlifyBase64(crypto.randomBytes(32).toString('base64'));
  const hash = crypto.createHash('sha256').digest('base64');
  const codeChallenge = urlifyBase64(hash);

  // Trim possible trailing slash from root URL
  const rootUrl = ROOT_URL.replace(/\/$/, '');
  const redirectUri = `${rootUrl}/login-as`;

  const location = `${CONSOLE_URL}/?\
response_type=code&\
client_id=${CLIENT_ID}&\
redirect_uri=${redirectUri}&\
user_id=${userId}&\
state=${state}&\
code_challenge=${codeChallenge}&\
code_challenge_method=S256`;

  res.cookie(generateKey(CLIENT_ID, 'st', 'oauth2State'), state);
  res.cookie(generateKey(CLIENT_ID, 'st', 'pkceCodeVerifier'), codeVerifier);
  return res.redirect(location);
});

exports.initiateLoginAs = router;
