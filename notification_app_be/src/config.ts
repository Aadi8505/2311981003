import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_API_URL: process.env.LOG_API_URL || 'http://20.207.122.201/evaluation-service/logs',
  ACCESS_TOKEN: process.env.ACCESS_TOKEN || '',
  NOTIFICATION_API_URL: process.env.NOTIFICATION_API_URL || 'http://20.207.122.201/evaluation-service/notifications',
  AUTH_API_URL: process.env.AUTH_API_URL || 'http://20.207.122.201/evaluation-service/auth',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/notifications',
  DB_NAME: 'notifications_db',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1,
  TTL_DAYS: 90,
  PRIORITY_CONFIG: {
    Placement: 5,
    Result: 3,
    Event: 1
  }
};

export function validateConfig(): void {
  if (!config.ACCESS_TOKEN) {
    process.stderr.write('⚠️  WARNING: ACCESS_TOKEN not set in environment\n');
  }
  
  if (!config.MONGODB_URI) {
    process.stderr.write('⚠️  WARNING: MONGODB_URI not set, using default localhost connection\n');
  }

  process.stdout.write(`✅ Configuration loaded: PORT=${config.PORT}, ENV=${config.NODE_ENV}, CORS=${config.CORS_ORIGIN}\n`);
}
