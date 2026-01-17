// services/QueueService.ts
import { redis, isRedisConnected } from '../config/redis';

export class QueueService {
  private readonly AUDIT_CHANNEL = 'audit-events';
  private redisAvailable: boolean = false;

  constructor() {
    this.checkRedisConnection();
  }

  private async checkRedisConnection(): Promise<void> {
    this.redisAvailable = await isRedisConnected();
    if (this.redisAvailable) {
      console.log('✅ QueueService using Redis (Upstash)');
    } else {
      console.warn('⚠️ QueueService: Redis not available');
    }
  }

  async publish(routingKey: string, data: any): Promise<void> {
    if (!this.redisAvailable) {
      console.warn('⚠️ Queue not available, skipping event publishing');
      return;
    }

    try {
      const message = JSON.stringify({
        service: 'appointment-service',
        action: routingKey,
        entityType: 'appointment',
        entityId: data.id,
        data: data,
        timestamp: new Date().toISOString()
      });

      // Publicar al canal de Redis
      await redis.publish(this.AUDIT_CHANNEL, message);
      
      console.log(`📤 Event published to Redis: ${routingKey}`, {
        channel: this.AUDIT_CHANNEL,
        entityId: data.id,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('❌ Error publishing to Redis:', error.message);
      // Marcar Redis como no disponible temporalmente
      this.redisAvailable = false;
      // Intentar reconectar después de 30 segundos
      setTimeout(() => this.checkRedisConnection(), 30000);
    }
  }
}