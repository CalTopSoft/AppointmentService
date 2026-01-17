// services/RedisSubscriber.ts
import { redis, isRedisConnected } from '../config/redis';
import { AuditService } from './AuditService';

export class RedisSubscriber {
  private auditService: AuditService;
  private readonly AUDIT_CHANNEL = 'audit-events';
  private isSubscribed: boolean = false;

  constructor(auditService: AuditService) {
    this.auditService = auditService;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      const connected = await isRedisConnected();
      if (!connected) {
        console.warn('⚠️ Redis not available, subscriber not started');
        return;
      }

      await redis.subscribe(this.AUDIT_CHANNEL);
      this.isSubscribed = true;
      
      console.log(`✅ Subscribed to Redis channel: ${this.AUDIT_CHANNEL}`);

      this.setupMessageHandler();

    } catch (error: any) {
      console.error('❌ Failed to subscribe to Redis channel:', error.message);
      this.isSubscribed = false;
    }
  }

  private setupMessageHandler(): void {
    redis.on('message', async (channel: string, message: string) => {
      if (channel === this.AUDIT_CHANNEL) {
        await this.handleMessage(message);
      }
    });

    redis.on('error', (err) => {
      console.error('❌ Redis subscriber error:', err.message);
      this.isSubscribed = false;
    });
  }

  private async handleMessage(message: string): Promise<void> {
    try {
      const data = JSON.parse(message);
      
      console.log(`📥 Received audit event: ${data.action}`, {
        entityId: data.entityId,
        service: data.service,
        timestamp: data.timestamp
      });

      // Guardar en MongoDB
      await this.auditService.create(data);

      console.log(`✅ Audit log saved: ${data.action}`, {
        entityId: data.entityId
      });

    } catch (error: any) {
      console.error('❌ Error processing Redis message:', error.message, {
        rawMessage: message.substring(0, 200) // Log parcial del mensaje
      });
    }
  }

  public getStatus(): { subscribed: boolean; channel: string } {
    return {
      subscribed: this.isSubscribed,
      channel: this.AUDIT_CHANNEL
    };
  }
}