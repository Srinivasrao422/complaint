const { ActivityLog } = require('../models');
const { sendEmail } = require('../services/email');

function adminNotifyEmail() {
  const a = process.env.ADMIN_NOTIFY_EMAIL;
  if (a && String(a).trim()) return String(a).trim();
  const c = process.env.SITE_CONTACT_EMAIL;
  if (c && String(c).trim()) return String(c).trim();
  const u = process.env.EMAIL_USER;
  if (u && String(u).trim()) return String(u).trim();
  return '';
}

function plainComplaint(c) {
  return c && typeof c.toObject === 'function' ? c.toObject() : c;
}

function maskAadhaarDigits(digits) {
  const d = String(digits || '').replace(/\D/g, '');
  if (d.length < 4) return '';
  return `********${d.slice(-4)}`;
}

function emitSocket(req, payload) {
  try {
    const io = req.app && req.app.get('io');
    if (!io) return;
    const c = payload.complaint;
    const plain = c && typeof c.toObject === 'function' ? c.toObject() : c;
    if (payload.type === 'complaint_created' && plain) {
      io.to('admins').emit('complaint:created', { complaint: plain });
    }
    if (payload.type === 'complaint_updated' && plain) {
      const uid = String(plain.userId || '');
      if (uid) io.to(`user:${uid}`).emit('complaint:updated', { complaint: plain });
      io.to('admins').emit('complaint:updated', { complaint: plain });
    }
    if (payload.type === 'feedback_submitted' && plain) {
      io.to('admins').emit('feedback:submitted', {
        complaintId: plain.complaintId,
        userId: plain.userId,
        rating: plain.rating,
      });
    }
  } catch (err) {
    console.warn('Socket emit:', err.message);
  }
}

/** Persist audit trail and emit realtime events. */
async function logAndEmit(req, payload) {
  try {
    const cid = payload.complaintId || payload.complaint?.complaintId || payload.complaint?._id;
    await ActivityLog.create({
      type: payload.type,
      message: String(payload.extraMessage || payload.type || '').slice(0, 500),
      userId: req.user?.id,
      complaintId: cid,
      meta: {
        complaintTitle: payload.complaint?.title,
      },
    });
  } catch (err) {
    console.warn('ActivityLog:', err.message);
  }
  emitSocket(req, payload);
}

async function notifyAdminOnComplaintCreated(memberEmail, complaint) {
  const to = adminNotifyEmail();
  if (!to) return { ok: false, skipped: true };
  const plain = plainComplaint(complaint);
  const app = process.env.APP_NAME || 'Smart Complaint Management System';
  const title = plain?.title || 'Complaint';
  const category = plain?.category || '';
  const subject = `[${app}] New complaint: ${title}`;
  const text = [
    'A new complaint was submitted.',
    '',
    `Title: ${title}`,
    `Category: ${category}`,
    `Member: ${memberEmail || 'unknown'}`,
    '',
    'Description:',
    String(plain?.description || '').slice(0, 6000),
  ].join('\n');
  return sendEmail({ to, subject, text });
}

async function emailMemberUpdated(memberEmail, complaint, notes) {
  if (!memberEmail) return { ok: false, skipped: true };
  const plain = plainComplaint(complaint);
  const app = process.env.APP_NAME || 'Smart Complaint Management System';
  const subject = `[${app}] Complaint update: ${plain?.title || 'Your complaint'}`;
  const text = [
    'Your complaint was updated by the administration.',
    '',
    `Title: ${plain?.title || ''}`,
    `Current status: ${plain?.status || ''}`,
    '',
    'Notes:',
    String(notes || '').slice(0, 4000),
  ].join('\n');
  return sendEmail({ to: memberEmail, subject, text });
}

async function notifyAdminOnFeedback(memberEmail, complaintTitle, rating, comment) {
  const to = adminNotifyEmail();
  if (!to) return { ok: false, skipped: true };
  const app = process.env.APP_NAME || 'Smart Complaint Management System';
  const subject = `[${app}] Feedback on a resolved complaint`;
  const text = [
    'A member submitted feedback after resolution.',
    '',
    `Member: ${memberEmail || 'unknown'}`,
    `Complaint: ${complaintTitle || ''}`,
    `Rating: ${rating}/5`,
    '',
    'Comment:',
    String(comment || '').slice(0, 2000),
  ].join('\n');
  return sendEmail({ to, subject, text });
}

module.exports = {
  logAndEmit,
  notifyAdminOnComplaintCreated,
  emailMemberUpdated,
  notifyAdminOnFeedback,
  maskAadhaarDigits,
};
