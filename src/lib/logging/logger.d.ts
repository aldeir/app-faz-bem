/**
 * TypeScript declarations for logger utility
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
}

/**
 * Debug level logging (gated by NODE_ENV)
 * Only outputs in non-production environments
 */
export function debug(message: string, context?: any): void;

/**
 * Info level logging
 * Always outputs regardless of environment
 */
export function info(message: string, context?: any): void;

/**
 * Warning level logging
 * Always outputs regardless of environment
 */
export function warn(message: string, context?: any): void;

/**
 * Error level logging
 * Always outputs regardless of environment
 */
export function error(message: string, context?: any): void;

/**
 * Logger module default export
 */
declare const logger: {
  debug: typeof debug;
  info: typeof info;
  warn: typeof warn;
  error: typeof error;
};

export = logger;