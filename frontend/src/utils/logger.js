// Frontend logging utility for Aasko Construction Invoice System

class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logLevel = this.isDevelopment ? 'debug' : 'info';
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 logs in memory
  }

  // Core logging method
  log(level, message, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      data,
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId()
    };

    // Add to memory logs
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output in development
    if (this.isDevelopment) {
      const consoleMethod = level === 'error' ? 'error' : 
                           level === 'warn' ? 'warn' : 
                           level === 'debug' ? 'debug' : 'log';
      
      console[consoleMethod](`[${level.toUpperCase()}] ${message}`, data);
    }

    // Send to backend in production (optional)
    if (!this.isDevelopment && level !== 'debug') {
      this.sendToBackend(logEntry);
    }
  }

  debug(message, data) {
    this.log('debug', message, data);
  }

  info(message, data) {
    this.log('info', message, data);
  }

  warn(message, data) {
    this.log('warn', message, data);
  }

  error(message, data) {
    this.log('error', message, data);
  }

  // API call logging
  logApiCall(method, url, status, responseTime, error = null) {
    const logData = {
      type: 'api_call',
      method,
      url,
      status,
      responseTime: `${responseTime}ms`,
      error: error ? error.message : null
    };

    if (error) {
      this.error(`API Error: ${method} ${url}`, logData);
    } else {
      this.info(`API Success: ${method} ${url}`, logData);
    }
  }

  // User action logging
  logUserAction(action, component, data = {}) {
    this.info(`User Action: ${action}`, {
      type: 'user_action',
      action,
      component,
      ...data
    });
  }

  // Page navigation logging
  logPageNavigation(from, to) {
    this.info(`Navigation: ${from} -> ${to}`, {
      type: 'navigation',
      from,
      to
    });
  }

  // Form submission logging
  logFormSubmission(formType, success, data = {}) {
    const message = `Form ${success ? 'Success' : 'Failed'}: ${formType}`;
    const logData = {
      type: 'form_submission',
      formType,
      success,
      ...data
    };

    if (success) {
      this.info(message, logData);
    } else {
      this.error(message, logData);
    }
  }

  // Authentication logging
  logAuthEvent(event, success, userEmail = null, error = null) {
    const message = `Auth: ${event} - ${success ? 'Success' : 'Failed'}`;
    const logData = {
      type: 'auth_event',
      event,
      success,
      userEmail,
      error: error ? error.message : null
    };

    if (success) {
      this.info(message, logData);
    } else {
      this.error(message, logData);
    }
  }

  // Performance logging
  logPerformance(metric, value, data = {}) {
    this.info(`Performance: ${metric}`, {
      type: 'performance',
      metric,
      value,
      ...data
    });
  }

  // Error boundary logging
  logError(error, errorInfo = {}) {
    this.error('React Error Boundary', {
      type: 'react_error',
      error: error.toString(),
      stack: error.stack,
      ...errorInfo
    });
  }

  // Get current user ID from localStorage or context
  getCurrentUserId() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || null;
    } catch {
      return null;
    }
  }

  // Get session ID
  getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  // Send logs to backend (for production monitoring)
  async sendToBackend(logEntry) {
    try {
      // Only send error and warning logs to backend
      if (logEntry.level === 'ERROR' || logEntry.level === 'WARN') {
        await fetch('/api/v1/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(logEntry)
        });
      }
    } catch (e) {
      // Silently fail to avoid infinite loops
      console.warn('Failed to send log to backend:', e);
    }
  }

  // Get logs for debugging
  getLogs(level = null, limit = 100) {
    let filteredLogs = this.logs;
    
    if (level) {
      filteredLogs = this.logs.filter(log => log.level === level.toUpperCase());
    }
    
    return filteredLogs.slice(-limit);
  }

  // Export logs for debugging
  exportLogs() {
    const logsStr = JSON.stringify(this.logs, null, 2);
    const blob = new Blob([logsStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `aasko-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    this.info('Logs cleared');
  }
}

// Create singleton instance
const logger = new Logger();

// React Hook for logging
export const useLogger = () => {
  return logger;
};

// API interceptor for automatic logging
export const createApiLogger = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      config.metadata = { startTime: new Date() };
      logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data
      });
      return config;
    },
    (error) => {
      logger.error('API Request Error', { error: error.message });
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      const endTime = new Date();
      const startTime = response.config.metadata.startTime;
      const responseTime = endTime - startTime;
      
      logger.logApiCall(
        response.config.method?.toUpperCase(),
        response.config.url,
        response.status,
        responseTime
      );
      
      return response;
    },
    (error) => {
      const endTime = new Date();
      const startTime = error.config?.metadata?.startTime || new Date();
      const responseTime = endTime - startTime;
      
      logger.logApiCall(
        error.config?.method?.toUpperCase(),
        error.config?.url,
        error.response?.status || 0,
        responseTime,
        error
      );
      
      return Promise.reject(error);
    }
  );
};

export default logger;
