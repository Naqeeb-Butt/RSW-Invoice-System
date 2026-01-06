# Aasko Construction Invoice System - Logging Documentation

## Overview

This system implements comprehensive logging across both backend and frontend to monitor all routes, requests, user actions, and system events.

## Backend Logging

### Setup

The backend uses structured JSON logging with the following components:

- **Logger Module**: `backend/logger.py`
- **JSON Formatter**: Structured log output
- **Request Middleware**: Automatic HTTP request/response logging
- **Event Loggers**: Specialized logging for different event types

### Log Levels

- **INFO**: General information, successful operations
- **WARNING**: Warning messages, failed authentication attempts
- **ERROR**: Error conditions, exceptions
- **DEBUG**: Detailed debugging information

### Log Categories

#### 1. Request Logging (`aasko.requests`)
Automatically logs all HTTP requests and responses:

```json
{
  "timestamp": "2026-01-05T00:15:30.123Z",
  "level": "INFO",
  "logger": "aasko.requests",
  "message": "Request completed: POST /api/v1/auth/login - 200",
  "request_id": "1641348930123-123456",
  "ip_address": "192.168.1.100",
  "method": "POST",
  "url": "http://localhost:2205/api/v1/auth/login",
  "status_code": 200,
  "response_time": 45.67
}
```

#### 2. Authentication Logging (`aasko.auth`)
Tracks all authentication events:

```json
{
  "timestamp": "2026-01-05T00:15:30.123Z",
  "level": "INFO",
  "logger": "aasko.auth",
  "message": "Auth event: LOGIN_SUCCESS - User: admin@aasko.com",
  "event_type": "LOGIN_SUCCESS",
  "user_email": "admin@aasko.com",
  "success": true,
  "details": "Token expires in 43200 minutes"
}
```

#### 3. Database Logging (`aasko.database`)
Logs all database operations:

```json
{
  "timestamp": "2026-01-05T00:15:30.123Z",
  "level": "INFO",
  "logger": "aasko.database",
  "message": "DB operation: CREATE on invoices - ID: 123 - User: 1",
  "operation": "CREATE",
  "table": "invoices",
  "record_id": 123,
  "user_id": 1
}
```

#### 4. Business Logic Logging (`aasko.business`)
Tracks business events and user actions:

```json
{
  "timestamp": "2026-01-05T00:15:30.123Z",
  "level": "INFO",
  "logger": "aasko.business",
  "message": "Business event: INVOICE_CREATED - User admin@aasko.com created invoice INV-0001",
  "event_type": "INVOICE_CREATED",
  "description": "User admin@aasko.com created invoice INV-0001",
  "user_id": 1,
  "invoice_id": 123,
  "client_id": 456,
  "total_amount": 1500.00
}
```

#### 5. Error Logging (`aasko.errors`)
Comprehensive error tracking:

```json
{
  "timestamp": "2026-01-05T00:15:30.123Z",
  "level": "ERROR",
  "logger": "aasko.errors",
  "message": "Error: ValidationError: Invalid email format",
  "error_type": "ValidationError",
  "error_message": "Invalid email format",
  "context": "User creation",
  "user_id": 1,
  "request_id": "1641348930123-123456"
}
```

### Request Tracking

Each request gets a unique ID for tracking:

```python
# Request ID format: timestamp-request_hash
request_id = "1641348930123-123456"
```

### Middleware Features

- **Request ID Generation**: Unique identifier for each request
- **IP Address Tracking**: Client IP with X-Forwarded-For support
- **Response Time Measurement**: Millisecond precision timing
- **User Agent Logging**: Browser/client identification
- **Error Context**: Full error details with stack traces

## Frontend Logging

### Setup

Frontend logging is implemented in `frontend/src/utils/logger.js`:

- **Structured Logging**: JSON format logs
- **API Interceptors**: Automatic API call logging
- **User Action Tracking**: Manual logging for user interactions
- **Performance Monitoring**: Response time and performance metrics
- **Error Boundary**: React error logging

### Log Categories

#### 1. API Call Logging
Automatic logging of all API requests:

```javascript
logger.logApiCall('POST', '/api/v1/auth/login', 200, 150);
```

#### 2. User Action Logging
Track user interactions:

```javascript
logger.logUserAction('BUTTON_CLICK', 'LoginForm', { button: 'submit' });
```

#### 3. Authentication Events
Login/logout tracking:

```javascript
logger.logAuthEvent('LOGIN', true, 'admin@aasko.com');
```

#### 4. Performance Metrics
Component rendering and API performance:

```javascript
logger.logPerformance('DASHBOARD_RENDER', 250, { component: 'Dashboard' });
```

#### 5. Error Logging
JavaScript errors and exceptions:

```javascript
logger.error('Component failed to render', { component: 'InvoiceForm', error: error.message });
```

### Session Tracking

Each user session gets a unique ID:

```javascript
sessionId: "session_1641348930123_abc123def"
```

## Log Analysis

### Backend Log Examples

#### Successful Login
```json
{
  "timestamp": "2026-01-05T00:15:30.123Z",
  "level": "INFO",
  "logger": "aasko.requests",
  "message": "Request completed: POST /api/v1/auth/login - 200",
  "request_id": "1641348930123-123456",
  "ip_address": "192.168.1.100",
  "method": "POST",
  "url": "http://localhost:2205/api/v1/auth/login",
  "status_code": 200,
  "response_time": 45.67
}
```

#### Failed Login
```json
{
  "timestamp": "2026-01-05T00:16:15.456Z",
  "level": "WARNING",
  "logger": "aasko.auth",
  "message": "Auth event: LOGIN_FAILED - User: fake@aasko.com - FAILED",
  "event_type": "LOGIN_FAILED",
  "user_email": "fake@aasko.com",
  "success": false,
  "details": "Invalid credentials"
}
```

#### Invoice Creation
```json
{
  "timestamp": "2026-01-05T00:17:22.789Z",
  "level": "INFO",
  "logger": "aasko.business",
  "message": "Business event: INVOICE_CREATED - User admin@aasko.com created invoice INV-0001",
  "event_type": "INVOICE_CREATED",
  "description": "User admin@aasko.com created invoice INV-0001",
  "user_id": 1,
  "invoice_id": 123,
  "client_id": 456,
  "total_amount": 1500.00
}
```

### Frontend Log Examples

#### Page Navigation
```json
{
  "timestamp": "2026-01-05T00:18:30.123Z",
  "level": "INFO",
  "message": "Navigation: /login -> /dashboard",
  "type": "navigation",
  "from": "/login",
  "to": "/dashboard",
  "url": "http://localhost:2004/dashboard",
  "userId": 1,
  "sessionId": "session_1641348930123_abc123def"
}
```

#### Form Submission
```json
{
  "timestamp": "2026-01-05T00:19:45.456Z",
  "level": "INFO",
  "message": "Form Success: InvoiceForm",
  "type": "form_submission",
  "formType": "InvoiceForm",
  "success": true,
  "invoiceId": 123,
  "userId": 1,
  "sessionId": "session_1641348930123_abc123def"
}
```

#### API Error
```json
{
  "timestamp": "2026-01-05T00:20:10.789Z",
  "level": "ERROR",
  "message": "API Error: GET /api/v1/invoices/999",
  "type": "api_call",
  "method": "GET",
  "url": "/api/v1/invoices/999",
  "status": 404,
  "responseTime": "125ms",
  "error": "Request failed with status code 404",
  "userId": 1,
  "sessionId": "session_1641348930123_abc123def"
}
```

## Monitoring and Debugging

### Real-time Monitoring

The system provides real-time logs for:

1. **API Performance**: Response times and error rates
2. **User Activity**: Login attempts, page navigation, form submissions
3. **Business Events**: Invoice creation, client management, exports
4. **System Health**: Database operations, authentication events

### Debugging Features

#### Request Tracing
Follow a request through the entire system:

```
Request ID: 1641348930123-123456
├── Frontend: API call initiated
├── Backend: Request received
├── Backend: Authentication check
├── Backend: Business logic executed
├── Backend: Response sent
└── Frontend: Response processed
```

#### Error Context
Detailed error information with context:

```json
{
  "error_type": "ValidationError",
  "error_message": "Invalid email format",
  "context": "User creation",
  "user_id": 1,
  "request_id": "1641348930123-123456",
  "stack_trace": "..."
}
```

### Log Export

#### Frontend Logs
Export frontend logs for debugging:

```javascript
// In browser console
logger.exportLogs();
```

#### Backend Logs
Backend logs are output to console in JSON format and can be redirected to files:

```bash
# Save logs to file
docker-compose logs backend > backend-logs.json

# Follow logs in real-time
docker-compose logs -f backend
```

## Production Considerations

### Log Levels in Production

- **Backend**: INFO and WARNING only (DEBUG disabled)
- **Frontend**: ERROR and WARNING only (INFO/DEBUG disabled)
- **API Logs**: Only errors and warnings sent to backend

### Performance Impact

- **Minimal Overhead**: Logging is optimized for performance
- **Async Operations**: Non-blocking log writing
- **Memory Management**: Circular buffer for frontend logs
- **Batch Processing**: Backend logs can be batched for external services

### Security

- **No Sensitive Data**: Passwords and tokens never logged
- **PII Protection**: Personal information minimized in logs
- **Access Control**: Log access restricted to administrators
- **Retention Policy**: Logs automatically cleaned up

## Configuration

### Backend Configuration

```python
# In logger.py
LOG_LEVEL = "INFO"  # DEBUG, INFO, WARNING, ERROR
MAX_LOG_SIZE = 1000  # Maximum logs in memory
LOG_FORMAT = "json"  # json or text
```

### Frontend Configuration

```javascript
// In logger.js
const config = {
  isDevelopment: process.env.NODE_ENV === 'development',
  logLevel: 'info',  // debug, info, warn, error
  maxLogs: 1000,
  enableBackendLogging: false  // Send logs to backend
};
```

## Troubleshooting

### Common Issues

1. **Missing Logs**: Check log levels and configuration
2. **Performance Issues**: Disable DEBUG logging in production
3. **Memory Usage**: Adjust maxLogs configuration
4. **File Permissions**: Ensure write access for log files

### Debug Commands

```bash
# Check backend logs
docker-compose logs backend | grep "ERROR"

# Check frontend logs
docker-compose logs frontend | grep "ERROR"

# Real-time monitoring
docker-compose logs -f --tail=100
```

This comprehensive logging system provides full visibility into all system operations, making it easy to monitor performance, debug issues, and track user activity across the entire Aasko Construction Invoice Management System.
