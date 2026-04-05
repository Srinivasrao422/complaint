/** Public-facing society / admin desk info for Contact page (override via .env). */
module.exports = {
  adminDisplayName: process.env.PUBLIC_ADMIN_NAME || 'Society Administration',
  adminEmail: process.env.PUBLIC_ADMIN_EMAIL || 'admin@example.com',
  adminPhone: process.env.PUBLIC_ADMIN_PHONE || '',
  buildingAddress:
    process.env.PUBLIC_BUILDING_ADDRESS ||
    'Registered society address — configure PUBLIC_BUILDING_ADDRESS in .env',
};
