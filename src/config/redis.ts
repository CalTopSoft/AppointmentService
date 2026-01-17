// config/redis.ts
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://default:AZ8QAAIncDI1ZjI2MjM5MGQxYjI0MWMzOWRhNzIzZjE5NmIzYWM5ZHAyNDA3MjA@top-stingray-40720.upstash.io:6379';

export const redis = new Redis(redisUrl, {
  tls: {
    rejectUnauthorized: false
  },
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis (Upstash)');
});

redis.on('ready', () => {
  console.log('✅ Redis connection ready');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

redis.on('close', () => {
  console.warn('⚠️ Redis connection closed');
});

// Exportar funciones auxiliares
export const isRedisConnected = async (): Promise<boolean> => {
  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
};