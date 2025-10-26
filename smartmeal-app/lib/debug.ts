/**
 * Debug Utility Library
 * Provides centralized, color-coded logging with context awareness and environment-based behavior
 */

// Log levels in order of severity
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SUCCESS = 4,
}

// Log level type for configuration
export type LogLevelType = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';

// Configuration interface
interface DebugConfig {
  enabled: boolean;
  minLevel: LogLevel;
  showTimestamp: boolean;
  colorEnabled: boolean;
  filter?: string;
}

// Default configuration
const defaultConfig: DebugConfig = {
  enabled: typeof window !== 'undefined' 
    ? process.env.NODE_ENV === 'development' || 
      localStorage.getItem('smartmeal_debug') === 'true'
    : process.env.NODE_ENV === 'development',
  minLevel: getMinLogLevel(),
  showTimestamp: true,
  colorEnabled: typeof window !== 'undefined',
  filter: typeof window !== 'undefined' 
    ? localStorage.getItem('debug_filter') || '*'
    : '*',
};

// Current configuration (can be modified at runtime)
let config: DebugConfig = { ...defaultConfig };

/**
 * Get minimum log level from environment or localStorage
 */
function getMinLogLevel(): LogLevel {
  if (typeof window !== 'undefined') {
    const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL;
    const storageLevel = localStorage.getItem('smartmeal_log_level');
    const levelStr = storageLevel || envLevel || 'INFO';
    return LogLevel[levelStr as LogLevelType] ?? LogLevel.INFO;
  }
  const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL || 'INFO';
  return LogLevel[envLevel as LogLevelType] ?? LogLevel.INFO;
}

/**
 * Color codes for different log levels
 */
const colors = {
  DEBUG: '#9E9E9E',
  INFO: '#2196F3',
  WARN: '#FF9800',
  ERROR: '#F44336',
  SUCCESS: '#4CAF50',
};

/**
 * Icons for different log levels
 */
const icons = {
  DEBUG: '🔍',
  INFO: 'ℹ️',
  WARN: '⚠️',
  ERROR: '❌',
  SUCCESS: '✅',
};

/**
 * Format timestamp as HH:MM:SS.mmm
 */
function formatTimestamp(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

/**
 * Check if log should be shown based on filter
 */
function shouldLog(context: string): boolean {
  if (!config.filter || config.filter === '*') return true;
  
  const filters = config.filter.split(',').map(f => f.trim());
  
  for (const filter of filters) {
    // Handle exclusion filters (starting with -)
    if (filter.startsWith('-')) {
      const excludePattern = filter.substring(1);
      if (matchesPattern(context, excludePattern)) {
        return false;
      }
    } else {
      // Handle inclusion filters
      if (matchesPattern(context, filter)) {
        return true;
      }
    }
  }
  
  return config.filter === '*';
}

/**
 * Match context against wildcard pattern
 */
function matchesPattern(context: string, pattern: string): boolean {
  const regexPattern = pattern
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  const regex = new RegExp(`^${regexPattern}$`, 'i');
  return regex.test(context);
}

/**
 * Core logging function
 */
function log(
  level: LogLevel,
  levelName: LogLevelType,
  context: string,
  message: string,
  data?: unknown
): void {
  // Check if logging is enabled
  if (!config.enabled) return;
  
  // Check log level
  if (level < config.minLevel) return;
  
  // Check filter
  if (!shouldLog(context)) return;
  
  // Format the log message
  const timestamp = config.showTimestamp ? `[${formatTimestamp()}]` : '';
  const icon = icons[levelName];
  const prefix = `${icon} [${levelName}] ${timestamp} [${context}]`;
  
  // Choose console method based on level
  const consoleMethod = 
    level === LogLevel.ERROR ? console.error :
    level === LogLevel.WARN ? console.warn :
    console.log;
  
  // Apply color styling in browser
  if (config.colorEnabled && typeof window !== 'undefined') {
    const color = colors[levelName];
    const style = `color: ${color}; font-weight: ${level >= LogLevel.WARN ? 'bold' : 'normal'}`;
    
    if (data !== undefined) {
      consoleMethod(`%c${prefix}`, style, message);
      console.log('  → Data:', data);
    } else {
      consoleMethod(`%c${prefix}`, style, message);
    }
  } else {
    // Server-side or plain logging
    if (data !== undefined) {
      consoleMethod(`${prefix} ${message}`);
      console.log('  → Data:', data);
    } else {
      consoleMethod(`${prefix} ${message}`);
    }
  }
}

/**
 * Public API for different log levels
 */
export const logger = {
  /**
   * Debug level logging (detailed debugging information)
   */
  debug(context: string, message: string, data?: unknown): void {
    log(LogLevel.DEBUG, 'DEBUG', context, message, data);
  },

  /**
   * Info level logging (general informational messages)
   */
  info(context: string, message: string, data?: unknown): void {
    log(LogLevel.INFO, 'INFO', context, message, data);
  },

  /**
   * Warning level logging (warning conditions)
   */
  warn(context: string, message: string, data?: unknown): void {
    log(LogLevel.WARN, 'WARN', context, message, data);
  },

  /**
   * Error level logging (error conditions)
   */
  error(context: string, message: string, data?: unknown, error?: Error): void {
    log(LogLevel.ERROR, 'ERROR', context, message, data);
    if (error && error.stack && process.env.NODE_ENV === 'development') {
      console.error('  → Stack:', error.stack);
    }
  },

  /**
   * Success level logging (successful operations)
   */
  success(context: string, message: string, data?: unknown): void {
    log(LogLevel.SUCCESS, 'SUCCESS', context, message, data);
  },

  /**
   * Group related logs together
   */
  group(context: string, label: string): void {
    if (!config.enabled) return;
    const timestamp = config.showTimestamp ? `[${formatTimestamp()}]` : '';
    console.group(`${timestamp} [${context}] ${label}`);
  },

  /**
   * End a log group
   */
  groupEnd(): void {
    if (!config.enabled) return;
    console.groupEnd();
  },

  /**
   * Start a performance timer
   */
  time(label: string): void {
    if (!config.enabled) return;
    console.time(label);
  },

  /**
   * End a performance timer
   */
  timeEnd(label: string): void {
    if (!config.enabled) return;
    console.timeEnd(label);
  },

  /**
   * Display data in table format
   */
  table(data: unknown): void {
    if (!config.enabled) return;
    console.table(data);
  },
};

/**
 * Configuration functions
 */
export const debugConfig = {
  /**
   * Set the minimum log level
   */
  setLogLevel(level: LogLevelType): void {
    config.minLevel = LogLevel[level];
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartmeal_log_level', level);
    }
  },

  /**
   * Enable or disable logging
   */
  setEnabled(enabled: boolean): void {
    config.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartmeal_debug', enabled ? 'true' : 'false');
    }
  },

  /**
   * Set filter pattern
   */
  setFilter(filter: string): void {
    config.filter = filter;
    if (typeof window !== 'undefined') {
      localStorage.setItem('debug_filter', filter);
    }
  },

  /**
   * Get current configuration
   */
  getConfig(): DebugConfig {
    return { ...config };
  },

  /**
   * Reset to default configuration
   */
  reset(): void {
    config = { ...defaultConfig };
    if (typeof window !== 'undefined') {
      localStorage.removeItem('smartmeal_debug');
      localStorage.removeItem('smartmeal_log_level');
      localStorage.removeItem('debug_filter');
    }
  },
};

/**
 * Utility function to sanitize sensitive data before logging
 */
export function sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'api_key'];
  const sanitized = { ...data };
  
  for (const key in sanitized) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

// Export default logger
export default logger;
