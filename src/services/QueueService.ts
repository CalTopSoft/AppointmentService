import { getChannel } from '../config/queue';

export class QueueService {
  private channel: any;

  constructor() {
    this.channel = getChannel();
  }

  async publish(routingKey: string, data: any): Promise<void> {
    if (!this.channel) {
      console.warn('⚠️  Queue not available, skipping event publishing');
      return;
    }

    try {
      const exchange = 'audit-exchange';
      const message = JSON.stringify({
        service: 'appointment-service',
        action: routingKey,
        entityType: 'appointment',
        entityId: data.id,
        data,
        timestamp: new Date(),
      });

      this.channel.publish(exchange, routingKey, Buffer.from(message), {
        persistent: true,
      });

      console.log(`📤 Event published: ${routingKey}`);
    } catch (error) {
      console.error('Error publishing to queue:', error);
    }
  }
}