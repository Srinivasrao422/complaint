function parseAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminEmail(email) {
  if (!email) return false;
  return parseAdminEmails().includes(String(email).toLowerCase());
}

module.exports = { isAdminEmail };
