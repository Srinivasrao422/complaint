const { OAuth2Client } = require('google-auth-library');

/**
 * @param {string} idToken
 * @returns {Promise<{ sub: string; email: string; name: string; emailVerified: boolean } | null>}
 */
async function verifyGoogleIdToken(idToken) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId || !idToken) return null;

  const client = new OAuth2Client(clientId);
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });
    const p = ticket.getPayload();
    if (!p || !p.sub || !p.email) return null;
    return {
      sub: p.sub,
      email: String(p.email).toLowerCase().trim(),
      name: String(p.name || p.email || 'User').trim().slice(0, 120),
      emailVerified: Boolean(p.email_verified),
    };
  } catch (err) {
    console.warn('[google-auth]', err.message);
    return null;
  }
}

module.exports = { verifyGoogleIdToken };
