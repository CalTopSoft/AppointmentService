import { Request, Response } from 'express';
import { AppointmentService } from '../services/AppointmentService';

export class AppointmentController {
  private service: AppointmentService;

  constructor() {
    this.service = new AppointmentService();
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { pacienteId, medicoId, fechaHora, motivo } = req.body;

      if (!pacienteId || !medicoId || !fechaHora || !motivo) {
        res.status(400).json({
          error: true,
          message: 'Todos los campos son obligatorios',
          code: 'MISSING_FIELDS',
        });
        return;
      }

      if (motivo.length < 10) {
        res.status(400).json({
          error: true,
          message: 'El motivo debe tener al menos 10 caracteres',
          code: 'INVALID_MOTIVO',
        });
        return;
      }

      const appointment = await this.service.create(req.body);
      res.status(201).json(appointment);
    } catch (error: any) {
      res.status(error.status || 500).json({
        error: true,
        message: error.message || 'Error al crear cita',
        code: error.code || 'INTERNAL_ERROR',
        details: error.details,
      });
    }
  };

  findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const appointments = await this.service.findAll(req.query);
      res.status(200).json(appointments);
    } catch (error) {
      res.status(500).json({ error: true, message: 'Error al obtener citas' });
    }
  };

  findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const appointment = await this.service.findById(req.params.id);
      if (!appointment) {
        res.status(404).json({
          error: true,
          message: 'Cita no encontrada',
          code: 'NOT_FOUND',
        });
        return;
      }
      res.status(200).json(appointment);
    } catch (error) {
      res.status(500).json({ error: true, message: 'Error al obtener cita' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const appointment = await this.service.update(req.params.id, req.body);
      res.status(200).json(appointment);
    } catch (error: any) {
      res.status(error.status || 500).json({
        error: true,
        message: error.message || 'Error al actualizar cita',
      });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.service.delete(req.params.id);
      res.status(200).json({ message: 'Cita cancelada exitosamente' });
    } catch (error: any) {
      res.status(error.status || 500).json({
        error: true,
        message: error.message || 'Error al cancelar cita',
      });
    }
  };
}