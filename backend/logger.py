import logging
import json
import time
from datetime import datetime
from typing import Dict, Any
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging"""
    
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        # Add extra fields if they exist
        if hasattr(record, 'user_id'):
            log_entry["user_id"] = record.user_id
        if hasattr(record, 'request_id'):
            log_entry["request_id"] = record.request_id
        if hasattr(record, 'ip_address'):
            log_entry["ip_address"] = record.ip_address
        if hasattr(record, 'method'):
            log_entry["method"] = record.method
        if hasattr(record, 'url'):
            log_entry["url"] = record.url
        if hasattr(record, 'status_code'):
            log_entry["status_code"] = record.status_code
        if hasattr(record, 'response_time'):
            log_entry["response_time"] = record.response_time
            
        return json.dumps(log_entry)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all HTTP requests and responses"""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Generate unique request ID
        request_id = f"{int(time.time() * 1000)}-{id(request)}"
        
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        
        # Log request
        logger = logging.getLogger("aasko.requests")
        logger.info(
            f"Request started: {request.method} {request.url.path}",
            extra={
                "request_id": request_id,
                "ip_address": client_ip,
                "method": request.method,
                "url": str(request.url),
                "user_agent": request.headers.get("User-Agent", "unknown"),
                "content_length": request.headers.get("Content-Length", "0")
            }
        )
        
        # Process request
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            
            # Log response
            logger.info(
                f"Request completed: {request.method} {request.url.path} - {response.status_code}",
                extra={
                    "request_id": request_id,
                    "ip_address": client_ip,
                    "method": request.method,
                    "url": str(request.url),
                    "status_code": response.status_code,
                    "response_time": round(process_time * 1000, 2)  # in milliseconds
                }
            )
            
            # Add request ID to response headers for debugging
            response.headers["X-Request-ID"] = request_id
            
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            
            # Log error
            logger.error(
                f"Request failed: {request.method} {request.url.path} - {str(e)}",
                extra={
                    "request_id": request_id,
                    "ip_address": client_ip,
                    "method": request.method,
                    "url": str(request.url),
                    "response_time": round(process_time * 1000, 2),
                    "error": str(e)
                }
            )
            
            # Re-raise the exception
            raise

def setup_logging():
    """Setup comprehensive logging configuration"""
    
    # Create logger
    logger = logging.getLogger("aasko")
    logger.setLevel(logging.INFO)
    
    # Remove existing handlers
    logger.handlers.clear()
    
    # Console handler with JSON formatter
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    
    # Use JSON formatter for structured logging
    json_formatter = JSONFormatter()
    console_handler.setFormatter(json_formatter)
    
    # Add handler to logger
    logger.addHandler(console_handler)
    
    # Create specific loggers for different components
    loggers = [
        "aasko.requests",    # HTTP requests/responses
        "aasko.auth",        # Authentication events
        "aasko.database",    # Database operations
        "aasko.business",    # Business logic
        "aasko.errors"       # Error tracking
    ]
    
    for logger_name in loggers:
        component_logger = logging.getLogger(logger_name)
        component_logger.setLevel(logging.INFO)
        component_logger.handlers.clear()
        component_logger.addHandler(console_handler)
        component_logger.propagate = False
    
    # Set specific log levels
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    
    return logger

# Authentication logging decorator
def log_auth_event(event_type: str, user_email: str = None, success: bool = True, details: str = None):
    """Log authentication events"""
    logger = logging.getLogger("aasko.auth")
    
    message = f"Auth event: {event_type}"
    if user_email:
        message += f" - User: {user_email}"
    if not success:
        message += " - FAILED"
    if details:
        message += f" - Details: {details}"
    
    level = logging.INFO if success else logging.WARNING
    
    logger.log(
        level,
        message,
        extra={
            "event_type": event_type,
            "user_email": user_email,
            "success": success,
            "details": details
        }
    )

# Database operation logging
def log_database_operation(operation: str, table: str, record_id: int = None, user_id: int = None):
    """Log database operations"""
    logger = logging.getLogger("aasko.database")
    
    message = f"DB operation: {operation} on {table}"
    if record_id:
        message += f" - ID: {record_id}"
    if user_id:
        message += f" - User: {user_id}"
    
    logger.info(
        message,
        extra={
            "operation": operation,
            "table": table,
            "record_id": record_id,
            "user_id": user_id
        }
    )

# Business logic logging
def log_business_event(event_type: str, description: str, user_id: int = None, data: Dict[str, Any] = None):
    """Log business events"""
    logger = logging.getLogger("aasko.business")
    
    message = f"Business event: {event_type} - {description}"
    
    extra = {
        "event_type": event_type,
        "description": description,
        "user_id": user_id
    }
    
    if data:
        extra.update(data)
    
    logger.info(message, extra=extra)

# Error logging
def log_error(error: Exception, context: str = None, user_id: int = None, request_id: str = None):
    """Log errors with context"""
    logger = logging.getLogger("aasko.errors")
    
    message = f"Error: {type(error).__name__}: {str(error)}"
    if context:
        message += f" - Context: {context}"
    
    logger.error(
        message,
        extra={
            "error_type": type(error).__name__,
            "error_message": str(error),
            "context": context,
            "user_id": user_id,
            "request_id": request_id
        }
    )
