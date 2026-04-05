function emailNotifyStatus(result) {
  if (!result) return 'skipped';
  if (result.skipped) return 'skipped';
  return result.ok ? 'sent' : 'failed';
}

module.exports = { emailNotifyStatus };
