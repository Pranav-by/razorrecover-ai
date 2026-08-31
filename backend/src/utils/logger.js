// Structured logger for RazorRecover AI
const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const CURRENT_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL || 'INFO'] || LOG_LEVELS.INFO;

function formatTimestamp() {
  return new Date().toISOString().replace('T', ' ').split('.')[0];
}

const logger = {
  debug: (msg, meta = {}) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.DEBUG)
      console.log(`[${formatTimestamp()}] [DEBUG] ${msg}`, Object.keys(meta).length ? meta : '');
  },
  info: (msg, meta = {}) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.INFO)
      console.log(`[${formatTimestamp()}] [INFO]  ${msg}`, Object.keys(meta).length ? meta : '');
  },
  warn: (msg, meta = {}) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.WARN)
      console.warn(`[${formatTimestamp()}] [WARN]  ${msg}`, Object.keys(meta).length ? meta : '');
  },
  error: (msg, meta = {}) => {
    console.error(`[${formatTimestamp()}] [ERROR] ${msg}`, Object.keys(meta).length ? meta : '');
  },
  agent: (agentName, msg, meta = {}) => {
    console.log(`[${formatTimestamp()}] [${agentName}] ${msg}`, Object.keys(meta).length ? meta : '');
  }
};

module.exports = logger;
