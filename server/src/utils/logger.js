const SENSITIVE_KEYS = ['password', 'token', 'authorization', 'secret', 'key', 'apiKey', 'access_token'];

function sanitize(data) {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitize);

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k))) {
      sanitized[key] = '***REDACTED***';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitize(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const logger = {
  info: (msg, meta = null) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, meta ? sanitize(meta) : '');
  },
  warn: (msg, meta = null) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, meta ? sanitize(meta) : '');
  },
  error: (msg, err = null) => {
    const errorDetails = err instanceof Error
      ? { message: err.message, code: err.code || err.statusCode, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined }
      : sanitize(err);
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, errorDetails || '');
  },
  debug: (msg, meta = null) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${msg}`, meta ? sanitize(meta) : '');
    }
  },
};
