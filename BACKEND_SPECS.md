# Backend Specifications for Restaurant Management System

This document contains detailed specifications for backend enhancements required to support advanced frontend features.

---

## 1. WebSocket Integration for Real-Time Updates

### Overview
Implement WebSocket server to provide real-time updates for orders, table status, and other critical events.

### Technical Requirements

#### Server-Side Implementation
- **WebSocket Server**: Use Socket.io or native WebSocket
- **Authentication**: Validate JWT tokens on connection
- **Event Broadcasting**: Emit events to connected clients
- **Connection Management**: Handle connections, disconnections, reconnections

#### Required Events

**Order Events:**
```typescript
// Client → Server
- 'order:created' - New order created
- 'order:updated' - Order status changed
- 'order:deleted' - Order cancelled

// Server → Client
- 'order:new' - Broadcast new order to all connected clients
- 'order:status_changed' - Broadcast status change
- 'order:deleted' - Broadcast order deletion
```

**Table Events:**
```typescript
// Client → Server
- 'table:updated' - Table status changed
- 'table:assigned' - Table assigned to order

// Server → Client
- 'table:status_changed' - Broadcast table status change
- 'table:assigned' - Broadcast table assignment
```

**Dashboard Events:**
```typescript
// Server → Client
- 'dashboard:updated' - Broadcast dashboard metrics update
- 'stats:updated' - Broadcast statistics update
```

#### API Endpoints

```typescript
// WebSocket connection endpoint
WS: /ws

// Authentication through query parameter
GET /ws?token={jwt_token}
```

#### Database Schema Changes
```sql
-- Optional: Add connection tracking table
CREATE TABLE websocket_connections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  socket_id VARCHAR(255) UNIQUE,
  connected_at TIMESTAMP DEFAULT NOW(),
  last_ping TIMESTAMP,
  disconnected_at TIMESTAMP
);
```

#### Security Considerations
- Validate JWT token on connection
- Rate limit WebSocket connections
- Implement connection limits per user
- Secure message validation
- Prevent unauthorized event broadcasting

#### Implementation Priority
1. **Phase 1**: Basic WebSocket server with authentication
2. **Phase 2**: Order status broadcasting
3. **Phase 3**: Table status broadcasting
4. **Phase 4**: Dashboard real-time updates
5. **Phase 5**: Advanced features (presence, typing indicators)

---

## 2. Audit Logs System

### Overview
Implement comprehensive activity tracking to record all user actions for security, compliance, and debugging.

### Technical Requirements

#### Database Schema
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'success',
  error_message TEXT
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

#### Required Actions to Log

**User Actions:**
- User login/logout
- Profile updates
- Password changes
- Role changes

**Order Actions:**
- Order creation
- Order status changes
- Order modifications
- Order deletion
- Payment completion

**Customer Actions:**
- Customer creation
- Customer updates
- Customer deletion
- Tier changes

**Menu Actions:**
- Menu item creation/updates/deletion
- Category changes
- Price changes

**Table Actions:**
- Table status changes
- Table assignments

#### API Endpoints

```typescript
// Get audit logs
GET /api/audit-logs
Query params:
- user_id: number
- entity_type: string
- entity_id: number
- action: string
- from_date: string
- to_date: string
- page: number
- limit: number

// Get specific entity audit trail
GET /api/audit-logs/:entity_type/:entity_id

// Export audit logs
GET /api/audit-logs/export
Query params:
- format: 'csv' | 'json' | 'pdf'
- date_range: string
- actions: string[]
```

#### Middleware Implementation
```typescript
// Audit middleware to intercept requests
function auditMiddleware(req, res, next) {
  const { user, method, path, body } = req;
  
  // Log action based on endpoint
  const action = determineAction(method, path);
  const entityType = determineEntityType(path);
  const entityId = extractEntityId(path, body);
  
  // Log to database
  auditLog.create({
    user_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    new_values: body,
    ip_address: req.ip,
    user_agent: req.headers['user-agent']
  });
  
  next();
}
```

#### Security Considerations
- Sensitive data masking (passwords, tokens)
- Read-only audit logs for most users
- Admin-only access to full audit history
- Implement log retention policy (e.g., 90 days)
- Log tamper detection (hash verification)

#### Implementation Priority
1. **Phase 1**: Database schema and basic logging
2. **Phase 2**: API endpoints for retrieval
3. **Phase 3**: Export functionality
4. **Phase 4**: Advanced filtering and analytics
5. **Phase 5**: Compliance features (GDPR, SOC2)

---

## 3. API Rate Limiting

### Overview
Implement rate limiting to prevent abuse, protect server resources, and ensure fair usage.

### Technical Requirements

#### Rate Limiting Strategy
- **Token Bucket Algorithm**: Recommended for API rate limiting
- **Sliding Window**: More accurate for time-based limits
- **Redis**: For distributed rate limiting

#### Rate Limits by Endpoint

```typescript
const rateLimits = {
  // Authentication endpoints
  '/api/auth/login': { requests: 5, window: '1m' },
  '/api/auth/register': { requests: 3, window: '1h' },
  '/api/auth/forgot-password': { requests: 3, window: '1h' },
  
  // General API endpoints
  '/api/*': { requests: 100, window: '1m' },
  
  // Read-heavy endpoints
  '/api/orders': { requests: 200, window: '1m' },
  '/api/menu': { requests: 200, window: '1m' },
  '/api/customers': { requests: 100, window: '1m' },
  
  // Write operations
  '/api/orders/*': { requests: 50, window: '1m' },
  '/api/customers/*': { requests: 30, window: '1m' },
  
  // File uploads
  '/api/upload': { requests: 10, window: '1m' },
  
  // Reports/exports
  '/api/reports/*': { requests: 20, window: '1m' },
};
```

#### Response Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1634567890
Retry-After: 60
```

#### Error Responses
```typescript
// Rate limit exceeded
{
  "success": false,
  "message": "Rate limit exceeded. Please try again later.",
  "errorCode": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

#### Database Schema (Optional)
```sql
-- For persistent rate limiting
CREATE TABLE rate_limits (
  id SERIAL PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL, -- IP or user_id
  endpoint VARCHAR(255) NOT NULL,
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMP DEFAULT NOW(),
  window_end TIMESTAMP
);

CREATE INDEX idx_rate_limits_identifier ON rate_limits(identifier, endpoint);
```

#### Implementation Options

**Option 1: Memory-based (Simple)**
```typescript
const rateLimiter = new Map();

function checkRateLimit(identifier, endpoint, limit, window) {
  const key = `${identifier}:${endpoint}`;
  const now = Date.now();
  
  if (!rateLimiter.has(key)) {
    rateLimiter.set(key, { count: 1, resetAt: now + window });
    return true;
  }
  
  const data = rateLimiter.get(key);
  if (now > data.resetAt) {
    data.count = 1;
    data.resetAt = now + window;
    return true;
  }
  
  if (data.count >= limit) {
    return false;
  }
  
  data.count++;
  return true;
}
```

**Option 2: Redis-based (Distributed)**
```typescript
import Redis from 'ioredis';

const redis = new Redis();

async function checkRateLimit(identifier, endpoint, limit, window) {
  const key = `ratelimit:${identifier}:${endpoint}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, window / 1000);
  }
  
  return current <= limit;
}
```

#### Middleware Implementation
```typescript
function rateLimitMiddleware(req, res, next) {
  const identifier = req.user?.id || req.ip;
  const endpoint = req.path;
  const limit = getRateLimit(endpoint);
  
  if (!checkRateLimit(identifier, endpoint, limit.requests, limit.window)) {
    return res.status(429).json({
      success: false,
      message: 'Rate limit exceeded',
      errorCode: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(limit.window / 1000)
    });
  }
  
  res.setHeader('X-RateLimit-Limit', limit.requests);
  res.setHeader('X-RateLimit-Remaining', limit.requests - 1);
  next();
}
```

#### Security Considerations
- Use user_id for authenticated requests, IP for anonymous
- Implement different limits for different user roles
- Add burst allowance for short-term spikes
- Monitor for abuse patterns
- Implement IP whitelist for trusted clients

#### Implementation Priority
1. **Phase 1**: Basic in-memory rate limiting
2. **Phase 2**: Redis-based distributed rate limiting
3. **Phase 3**: Role-based rate limits
4. **Phase 4**: Advanced monitoring and analytics
5. **Phase 5**: Automatic abuse detection

---

## 4. Scheduled Report Exports

### Overview
Implement background job scheduling to generate and email reports automatically.

### Technical Requirements

#### Job Scheduler Options
- **Bull Queue**: Redis-based job queue
- **node-cron**: Simple cron-based scheduling
- **Agenda**: MongoDB-backed job scheduler
- **Kue**: Redis-based job queue

#### Report Types

```typescript
interface ScheduledReport {
  id: number;
  user_id: number;
  report_type: 'daily_sales' | 'weekly_orders' | 'monthly_performance' | 'custom';
  schedule: string; // cron expression
  format: 'pdf' | 'csv' | 'excel';
  recipients: string[]; // email addresses
  parameters: {
    date_range?: string;
    filters?: Record<string, any>;
    columns?: string[];
  };
  active: boolean;
  created_at: Date;
  last_run_at?: Date;
  next_run_at?: Date;
}
```

#### Database Schema
```sql
CREATE TABLE scheduled_reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  report_type VARCHAR(50) NOT NULL,
  schedule VARCHAR(100) NOT NULL,
  format VARCHAR(20) NOT NULL,
  recipients JSONB NOT NULL,
  parameters JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  last_run_at TIMESTAMP,
  next_run_at TIMESTAMP
);

CREATE TABLE report_executions (
  id SERIAL PRIMARY KEY,
  scheduled_report_id INTEGER REFERENCES scheduled_reports(id),
  status VARCHAR(20) NOT NULL,
  file_path VARCHAR(255),
  error_message TEXT,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  file_size INTEGER
);

CREATE INDEX idx_scheduled_reports_user ON scheduled_reports(user_id);
CREATE INDEX idx_scheduled_reports_active ON scheduled_reports(active);
CREATE INDEX idx_report_executions_report ON report_executions(scheduled_report_id);
```

#### API Endpoints

```typescript
// Create scheduled report
POST /api/reports/scheduled
Body: {
  report_type: string;
  schedule: string; // cron expression
  format: 'pdf' | 'csv' | 'excel';
  recipients: string[];
  parameters?: any;
}

// List scheduled reports
GET /api/reports/scheduled
Query params:
- user_id: number
- active: boolean
- report_type: string

// Update scheduled report
PUT /api/reports/scheduled/:id

// Delete scheduled report
DELETE /api/reports/scheduled/:id

// Get report execution history
GET /api/reports/scheduled/:id/executions

// Manually trigger report
POST /api/reports/scheduled/:id/trigger

// Download generated report
GET /api/reports/:execution_id/download
```

#### Cron Expression Examples
```typescript
// Daily at 9 AM
'0 9 * * *'

// Weekly on Monday at 9 AM
'0 9 * * 1'

// Monthly on 1st at 9 AM
'0 9 1 * *'

// Every 6 hours
'0 */6 * * *'

// Every weekday at 9 AM
'0 9 * * 1-5'
```

#### Email Service Integration
```typescript
interface EmailService {
  sendReport(recipients: string[], reportData: Buffer, format: string, reportName: string): Promise<void>;
}

// Example implementation using Nodemailer
async function sendReportEmail(recipients, reportData, format, reportName) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const attachments = [{
    filename: `${reportName}.${format}`,
    content: reportData
  }];

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: recipients.join(','),
    subject: `Restaurant Report: ${reportName}`,
    text: 'Please find the attached report.',
    attachments
  });
}
```

#### Job Queue Implementation (Bull)
```typescript
import Queue from 'bull';

const reportQueue = new Queue('reports', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

// Process report generation
reportQueue.process(async (job) => {
  const { reportId, parameters } = job.data;
  
  try {
    // Generate report
    const reportData = await generateReport(parameters);
    
    // Save to storage
    const filePath = await saveReport(reportData, parameters.format);
    
    // Send email
    await sendReportEmail(reportData.recipients, reportData, parameters.format);
    
    // Update execution record
    await updateReportExecution(reportId, 'completed', filePath);
    
  } catch (error) {
    await updateReportExecution(reportId, 'failed', null, error.message);
    throw error;
  }
});

// Schedule job
async function scheduleReport(reportConfig) {
  await reportQueue.add('generate-report', reportConfig, {
    repeat: { cron: reportConfig.schedule },
    jobId: `report-${reportConfig.id}`
  });
}
```

#### Security Considerations
- Validate email addresses
- Rate limit report generation
- Implement file size limits
- Secure file storage with encryption
- Implement access control for reports
- Audit all report generation

#### Implementation Priority
1. **Phase 1**: Basic job scheduling
2. **Phase 2**: Report generation and email sending
3. **Phase 3**: API endpoints for management
4. **Phase 4**: Advanced scheduling features
5. **Phase 5**: Analytics and monitoring

---

## 5. Implementation Timeline

### Week 1-2: WebSocket Integration
- Day 1-3: WebSocket server setup and authentication
- Day 4-6: Order event broadcasting
- Day 7-8: Table event broadcasting
- Day 9-10: Dashboard real-time updates

### Week 3-4: Audit Logs
- Day 1-3: Database schema and logging middleware
- Day 4-6: API endpoints for retrieval
- Day 7-8: Export functionality
- Day 9-10: Advanced filtering

### Week 5: API Rate Limiting
- Day 1-3: In-memory rate limiting
- Day 4-5: Redis-based implementation
- Day 6-7: Role-based limits
- Day 8-10: Monitoring and analytics

### Week 6: Scheduled Reports
- Day 1-3: Job scheduler setup
- Day 4-6: Report generation
- Day 7-8: Email integration
- Day 9-10: API endpoints and management

---

## 6. Testing Requirements

### WebSocket Testing
- Connection authentication
- Event broadcasting
- Reconnection handling
- Multiple concurrent connections
- Security testing

### Audit Logs Testing
- Action logging accuracy
- Data integrity
- Performance impact
- Export functionality
- Security testing

### Rate Limiting Testing
- Limit enforcement
- Different user roles
- Distributed scenarios
- Bypass attempts
- Performance testing

### Scheduled Reports Testing
- Job scheduling accuracy
- Report generation
- Email delivery
- Error handling
- Performance testing

---

## 7. Monitoring and Logging

### Required Metrics
- WebSocket connection count
- Audit log volume
- Rate limit violations
- Job queue length
- Report generation time
- Email delivery rate

### Alerts
- High WebSocket disconnection rate
- Audit log failures
- Rate limit abuse
- Job queue backup
- Email delivery failures

---

## 8. Deployment Considerations

### WebSocket
- Use separate WebSocket server
- Load balancer configuration
- SSL/TLS support
- Connection pooling

### Audit Logs
- Database backup strategy
- Log rotation
- Storage capacity planning
- Query optimization

### Rate Limiting
- Redis configuration
- Memory optimization
- Monitoring setup
- Capacity planning

### Scheduled Reports
- Job queue configuration
- File storage strategy
- Email service setup
- Error handling

---

## 9. API Documentation Updates

Update API documentation to include:
- WebSocket connection details
- Audit log endpoints
- Rate limit headers
- Scheduled report endpoints
- New error codes

---

## 10. Security Checklist

- [ ] WebSocket authentication
- [ ] Audit log data masking
- [ ] Rate limit enforcement
- [ ] Email service security
- [ ] File storage encryption
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] API key management

---

## Contact Information

For questions or clarifications regarding these specifications, contact the development team.
