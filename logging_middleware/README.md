# Logging Middleware - Campus Notification System

Production-grade structured logging middleware for both backend and frontend.

## Features

✅ **Structured Logging** - Consistent log format across the application  
✅ **API Integration** - Sends logs to evaluation service endpoint  
✅ **Retry Logic** - Exponential backoff for failed requests  
✅ **Queue Management** - Handles offline scenarios gracefully  
✅ **No console.log** - Replace all default logging  
✅ **Reusable** - Works in both backend (Express) and frontend (React)

## Files

- `logger.ts` - Core Logger class with API integration
- `expressMiddleware.ts` - Express.js middleware wrapper
- `useLogger.ts` - React hooks for component logging

## Backend Usage

### 1. Initialize Logger

```typescript
// src/index.ts
import { Logger } from "../logging_middleware/logger";
import {
  requestLoggingMiddleware,
  errorLoggingMiddleware,
} from "../logging_middleware/expressMiddleware";
import express from "express";

const app = express();
const logger = new Logger(
  "http://20.207.122.201/evaluation-service/logs",
  process.env.ACCESS_TOKEN || "",
);

// Add middleware
app.use(requestLoggingMiddleware(logger));

// Your routes here...

// Error handler (must be last)
app.use(errorLoggingMiddleware(logger));
```

### 2. Use in Handlers

```typescript
import { Logger } from "../logging_middleware/logger";

export async function createNotification(req: any, res: any) {
  const logger: Logger = req.logger;

  try {
    logger.log("backend", "info", "handler", "Creating new notification", {
      userId: req.user.id,
    });

    const result = await notificationService.create(req.body);

    logger.log(
      "backend",
      "info",
      "handler",
      "Notification created successfully",
      { notificationId: result.id },
    );

    res.json(result);
  } catch (error) {
    logger.log(
      "backend",
      "error",
      "handler",
      `Failed to create notification: ${error.message}`,
      { error: error.stack },
    );

    res.status(500).json({ error: "Failed to create notification" });
  }
}
```

### 3. Use in Services

```typescript
import { Logger } from "../logging_middleware/logger";

class NotificationService {
  constructor(private logger: Logger) {}

  async fetchNotifications(studentID: string) {
    this.logger.log(
      "backend",
      "info",
      "service",
      `Fetching notifications for student ${studentID}`,
    );

    try {
      const notifications = await db.notifications.find({ studentID });

      this.logger.log(
        "backend",
        "info",
        "service",
        `Found ${notifications.length} notifications`,
        { count: notifications.length },
      );

      return notifications;
    } catch (error) {
      this.logger.log(
        "backend",
        "error",
        "service",
        `Database query failed: ${error.message}`,
      );
      throw error;
    }
  }
}
```

### 4. Use in Repositories

```typescript
import { Logger } from "../logging_middleware/logger";

class NotificationRepository {
  constructor(private logger: Logger) {}

  async markAsRead(notificationID: string) {
    this.logger.log(
      "backend",
      "debug",
      "repository",
      `Updating notification ${notificationID}`,
      { operation: "mark_as_read" },
    );

    const result = await db.notifications.updateOne(
      { _id: notificationID },
      { $set: { isRead: true } },
    );

    this.logger.log(
      "backend",
      "info",
      "repository",
      `Notification ${notificationID} marked as read`,
    );

    return result;
  }
}
```

## Frontend Usage

### 1. Setup in App Component

```typescript
// src/App.tsx
import { useLogger } from '../logging_middleware/useLogger';

function App() {
  const logger = useLogger();

  useEffect(() => {
    // Set token if available
    const token = localStorage.getItem('accessToken');
    if (token) {
      logger.setAccessToken(token);
    }

    logger.log('frontend', 'info', 'page', 'App initialized');
  }, [logger]);

  return <div>{/* Your app content */}</div>;
}
```

### 2. Use in Components

```typescript
// src/components/NotificationList.tsx
import { useComponentLogger, useApiLogger } from '../logging_middleware/useLogger';

function NotificationList() {
  const logger = useComponentLogger('NotificationList');
  const { logApiCall } = useApiLogger();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await logApiCall(
        'GET',
        '/api/notifications',
        () => fetch('/api/notifications').then(r => r.json()),
        { limit: 20, page: 1 }
      );

      setNotifications(data);

      logger.log(
        'frontend',
        'info',
        'component',
        `Loaded ${data.length} notifications`
      );
    };

    fetchData();
  }, [logger, logApiCall]);

  return (
    <div>
      {notifications.map(n => (
        <NotificationCard key={n.ID} notification={n} />
      ))}
    </div>
  );
}
```

### 3. Error Handling in Components

```typescript
// src/components/ErrorBoundary.tsx
import { useErrorLogger } from "../logging_middleware/useLogger";

class ErrorBoundary extends React.Component {
  logError = () => {
    const logger = useErrorLogger("ErrorBoundary");
    return logger;
  };

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const logger = this.logError();

    logger(error, {
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    // Render error UI
  }
}
```

## Log Levels

| Level     | Usage                    | Example                      |
| --------- | ------------------------ | ---------------------------- |
| **debug** | Detailed diagnostic info | "Cache hit for user123"      |
| **info**  | General informational    | "Notification created"       |
| **warn**  | Warning condition        | "High API response time"     |
| **error** | Error condition          | "Database connection failed" |
| **fatal** | System failure           | "Critical database error"    |

## Backend Packages

- `cache` - Caching layer
- `controller` - Request handlers
- `cron_job` - Scheduled jobs
- `db` - Database operations
- `domain` - Business logic
- `handler` - HTTP handlers
- `repository` - Data access
- `route` - Route definitions
- `service` - Business services
- `auth` - Authentication
- `config` - Configuration
- `middleware` - Middleware
- `utils` - Utility functions

## Frontend Packages

- `api` - API calls
- `component` - React components
- `hook` - Custom hooks
- `page` - Page components
- `state` - State management
- `style` - Styling
- `auth` - Authentication
- `config` - Configuration
- `middleware` - Middleware
- `utils` - Utility functions

## API Integration

### Log Endpoint

```
POST http://20.207.122.201/evaluation-service/logs

Headers:
  Authorization: Bearer {access_token}
  Content-Type: application/json

Body:
{
  "stack": "backend" | "frontend",
  "level": "debug" | "info" | "warn" | "error" | "fatal",
  "package": "package_name",
  "message": "log message"
}

Response (200):
{
  "logID": "unique-id",
  "message": "log created successfully"
}
```

## Configuration

### Environment Variables

```bash
# Backend
LOG_API_URL=http://20.207.122.201/evaluation-service/logs
LOG_ACCESS_TOKEN=your_access_token

# Frontend (.env or .env.local)
REACT_APP_LOG_API_URL=http://20.207.122.201/evaluation-service/logs
REACT_APP_ACCESS_TOKEN=your_access_token
```

## Features

### Queue Management

- Logs are queued before sending
- Failed sends are retried with exponential backoff
- Max 1000 logs in queue (FIFO)
- Automatic flush on app shutdown

### Retry Logic

- 3 retry attempts per log
- Exponential backoff: 1s → 2s → 4s
- Failed after retries logged locally
- Circuit breaker for API health

### Performance

- Non-blocking async logging
- Batch processing of logs
- Efficient queue management
- Minimal memory footprint

### Debugging

- Structured log format
- Request IDs for tracing
- Full context preservation
- Local fallback on API failure

## Examples

### Example 1: Backend - Handler

```typescript
logger.log("backend", "error", "handler", "received string, expected bool");
```

### Example 2: Backend - Database

```typescript
logger.log("backend", "fatal", "db", "Critical database connection failure.");
```

### Example 3: Frontend - Component

```typescript
logger.log(
  "frontend",
  "info",
  "component",
  "NotificationList rendered with 10 items",
);
```

### Example 4: Frontend - API

```typescript
logger.log(
  "frontend",
  "error",
  "api",
  "Failed to fetch notifications: Network timeout after 5s",
);
```

## Testing

```typescript
import { Logger } from "./logger";

// Test logger
const logger = new Logger("http://localhost:3001/logs", "test-token");

// Test log
await logger.log("backend", "info", "controller", "Test message");

// Check queue
console.log(logger.getQueueSize()); // 0 after successful send

// Test error handling
await logger.log("backend", "error", "handler", "Test error log");
```

## Production Deployment

1. ✅ Set `LOG_ACCESS_TOKEN` environment variable
2. ✅ Ensure API endpoint is reachable
3. ✅ Monitor log queue size
4. ✅ Setup centralized log collection
5. ✅ Configure log retention policies

## Troubleshooting

### Logs not appearing

- Check access token validity
- Verify API endpoint connectivity
- Check network logs for failures
- Look for errors in browser console

### Queue growing indefinitely

- API endpoint might be down
- Check network connectivity
- Verify access token is correct
- Check API service logs

### Performance issues

- Reduce log verbosity
- Increase queue flush interval
- Check network latency
- Profile logger performance

---

**Version:** 1.0  
**Last Updated:** May 5, 2026  
**Status:** Production Ready
