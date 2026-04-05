'use strict';

const { execSync } = require('child_process');

function killPidsWin(pids) {
  for (const pid of pids) {
    try {
      execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
    } catch (_) {
      /* ignore */
    }
  }
}

try {
  if (process.platform === 'win32') {
    const out = execSync('netstat -ano', { encoding: 'utf8' });
    const pids = new Set();
    for (const line of out.split(/\r?\n/)) {
      if (!line.includes('LISTENING') || !/:5000\s/.test(line)) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (/^\d+$/.test(pid)) pids.add(pid);
    }
    killPidsWin(pids);
  } else {
    try {
      const pids = execSync('lsof -ti:5000', {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
      if (pids) {
        for (const pid of pids.split(/\s+/)) {
          if (!/^\d+$/.test(pid)) continue;
          try {
            execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
          } catch (_) {
            /* ignore */
          }
        }
      }
    } catch (_) {
      /* nothing listening */
    }
  }
} catch (_) {
  /* ignore */
}

process.exit(0);
