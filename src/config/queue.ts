import * as amqp from 'amqplib';
import * as dotenv from 'dotenv';

dotenv.config();

let connection: any = null;
let channel: any = null;

export const connectRabbitMQ = async () => {
  try {
    const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    const exchange = 'audit-exchange';
    await channel.assertExchange(exchange, 'topic', { durable: true });

    console.log('✅ RabbitMQ connected');
    return { connection, channel };
  } catch (error) {
    console.warn('⚠️  RabbitMQ not available, continuing without it');
    return { connection: null, channel: null };
  }
};

export const getChannel = () => channel;
export const getConnection = () => connection;