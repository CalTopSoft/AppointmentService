import { createApp } from './app';
import { AppDataSource } from './config/database';
import { connectRabbitMQ } from './config/queue';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3002;

const startServer = async () => {
  try {
    // Inicializar PostgreSQL
    await AppDataSource.initialize();
    console.log('✅ Database connected (Appointments)');

    // Intentar conectar a RabbitMQ (opcional)
    await connectRabbitMQ();

    const app = createApp();
    app.listen(PORT, () => {
      console.log(`🚀 Appointment Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();