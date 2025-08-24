/**
 * Lightweight Logger Utility for App Faz Bem
 * Tree-shakable logging functions with environment gating
 * 
 * @version 1.0.0
 * @author App Faz Bem Team
 */

/**
 * Log levels enumeration
 * @readonly
 * @typedef {'debug' | 'info' | 'warn' | 'error'} LogLevel
 */

/**
 * Log entry structure
 * @typedef {Object} LogEntry
 * @property {string} timestamp - ISO timestamp
 * @property {LogLevel} level - Log level
 * @property {string} message - Log message
 * @property {Object} [context] - Optional context object
 */

/**
 * Internal emit function that chooses appropriate console method
 * @private
 * @param {LogLevel} level - Log level
 * @param {string} message - Log message
 * @param {Object} [context] - Optional context object
 */
function emit(level, message, context) {
  const timestamp = new Date().toISOString();
  
  const logEntry = {
    timestamp,
    level,
    message
  };
  
  if (context) {
    logEntry.context = context;
  }
  
  // Choose console method based on level
  const consoleMethod = {
    debug: 'debug',
    info: 'info', 
    warn: 'warn',
    error: 'error'
  }[level] || 'log';
  
  console[consoleMethod](`[${timestamp}] ${level.toUpperCase()}: ${message}`, context || '');
}

/**
 * Debug level logging (gated by NODE_ENV)
 * Only outputs in non-production environments
 * 
 * @param {string} message - Debug message
 * @param {Object} [context] - Optional context object
 * 
 * @example
 * debug('Computing campaign status', { campaignId: '123', now: new Date() });
 */
function debug(message, context) {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
    return;
  }
  
  // Also check for browser environment variable
  if (typeof window !== 'undefined' && window.ENV === 'production') {
    return;
  }
  
  emit('debug', message, context);
}

/**
 * Info level logging
 * Always outputs regardless of environment
 * 
 * @param {string} message - Info message
 * @param {Object} [context] - Optional context object
 * 
 * @example
 * info('Campaign status computed successfully', { status: 'active' });
 */
function info(message, context) {
  emit('info', message, context);
}

/**
 * Warning level logging
 * Always outputs regardless of environment
 * 
 * @param {string} message - Warning message
 * @param {Object} [context] - Optional context object
 * 
 * @example
 * warn('Invalid date provided, using fallback', { providedDate: 'invalid' });
 */
function warn(message, context) {
  emit('warn', message, context);
}

/**
 * Error level logging
 * Always outputs regardless of environment
 * 
 * @param {string} message - Error message
 * @param {Object} [context] - Optional context object
 * 
 * @example
 * error('Failed to parse campaign dates', { error: errorObj, campaign });
 */
function error(message, context) {
  emit('error', message, context);
}

// CommonJS exports
module.exports = {
  debug,
  info,
  warn,
  error
};