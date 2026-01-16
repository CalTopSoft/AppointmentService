import express from 'express';
import cors from 'cors';
import appointmentRoutes from './routes/appointment.routes';

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/appointments', appointmentRoutes);

  app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'appointment-service' });
  });

  // Manejo de errores global
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
      error: true,
      message: err.message || 'Error interno del servidor',
      code: err.code || 'INTERNAL_ERROR',
    });
  });

  return app;
};