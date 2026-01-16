import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from '../models/Appointment';
import { AppDataSource } from '../config/database';
import axios from 'axios';
import { QueueService } from './QueueService';

export class AppointmentService {
  private repository: Repository<Appointment>;
  private queueService: QueueService;

  constructor() {
    this.repository = AppDataSource.getRepository(Appointment);
    this.queueService = new QueueService();
  }

  async create(data: Partial<Appointment>): Promise<Appointment> {
    return await AppDataSource.transaction(async (manager) => {
      // Convertir fechaHora a Date si viene como string desde el frontend
      let fechaHoraDate: Date;
      
      if (typeof data.fechaHora === 'string') {
        fechaHoraDate = new Date(data.fechaHora);
        // Validar si la conversión fue exitosa
        if (isNaN(fechaHoraDate.getTime())) {
          throw {
            status: 400,
            message: 'Formato de fecha inválido',
            code: 'INVALID_DATE_FORMAT',
          };
        }
        // Actualizar data.fechaHora con el objeto Date
        data.fechaHora = fechaHoraDate;
      } else if (data.fechaHora instanceof Date) {
        fechaHoraDate = data.fechaHora;
      } else {
        throw {
          status: 400,
          message: 'Fecha no proporcionada o formato incorrecto',
          code: 'MISSING_DATE',
        };
      }

      // Validar que el médico y paciente existen
      await this.validateDoctor(data.medicoId!);
      await this.validatePatient(data.pacienteId!);

      // Validar horario laboral (ahora fechaHoraDate es un objeto Date válido)
      this.validateWorkingHours(fechaHoraDate);

      // CRÍTICO: Verificar disponibilidad con LOCK PESIMISTA
      const conflict = await manager
        .createQueryBuilder(Appointment, 'a')
        .setLock('pessimistic_write')
        .where('a.medicoId = :medicoId', { medicoId: data.medicoId })
        .andWhere('a.fechaHora = :fechaHora', { fechaHora: data.fechaHora })
        .andWhere('a.estado != :estado', { estado: AppointmentStatus.CANCELADA })
        .getOne();

      if (conflict) {
        throw {
          status: 409,
          message: 'El médico ya tiene una cita agendada en ese horario',
          code: 'DOUBLE_BOOKING',
          details: { citaExistente: conflict.id },
        };
      }

      // Crear la cita
      const appointment = manager.create(Appointment, {
        ...data,
        estado: AppointmentStatus.AGENDADA,
      });

      const saved = await manager.save(appointment);

      // Publicar evento de auditoría
      await this.queueService.publish('audit.appointment.created', saved);

      return saved;
    });
  }

  private async validateDoctor(id: string): Promise<void> {
    try {
      const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
      await axios.get(`${USER_SERVICE_URL}/api/users/doctors/${id}`);
    } catch (error) {
      throw {
        status: 404,
        message: 'Médico no encontrado',
        code: 'DOCTOR_NOT_FOUND',
      };
    }
  }

  private async validatePatient(id: string): Promise<void> {
    try {
      const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
      await axios.get(`${USER_SERVICE_URL}/api/users/patients/${id}`);
    } catch (error) {
      throw {
        status: 404,
        message: 'Paciente no encontrado',
        code: 'PATIENT_NOT_FOUND',
      };
    }
  }

  private validateWorkingHours(fecha: Date): void {
    // Asegurar que es un objeto Date válido
    if (!(fecha instanceof Date) || isNaN(fecha.getTime())) {
      throw {
        status: 400,
        message: 'Fecha inválida para validar horario',
        code: 'INVALID_DATE',
      };
    }

    const day = fecha.getDay();
    const hour = fecha.getHours();

    // Lunes(1) a Viernes(5), 8AM a 6PM
    if (day === 0 || day === 6) {
      throw {
        status: 400,
        message: 'No se pueden agendar citas los fines de semana',
        code: 'INVALID_DAY',
      };
    }

    if (hour < 8 || hour >= 18) {
      throw {
        status: 400,
        message: 'Las citas deben ser entre 8:00 AM y 6:00 PM',
        code: 'INVALID_HOUR',
      };
    }
  }

  async findAll(filters?: any): Promise<Appointment[]> {
    const query = this.repository.createQueryBuilder('a');

    if (filters?.pacienteId) {
      query.andWhere('a.pacienteId = :pacienteId', {
        pacienteId: filters.pacienteId,
      });
    }

    if (filters?.medicoId) {
      query.andWhere('a.medicoId = :medicoId', { medicoId: filters.medicoId });
    }

    if (filters?.fecha) {
      query.andWhere('DATE(a.fechaHora) = :fecha', { fecha: filters.fecha });
    }

    return await query.getMany();
  }

  async findById(id: string): Promise<Appointment | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async update(id: string, data: Partial<Appointment>): Promise<Appointment> {
    const appointment = await this.findById(id);
    if (!appointment) {
      throw { status: 404, message: 'Cita no encontrada', code: 'NOT_FOUND' };
    }

    // Si se actualiza fechaHora y viene como string, convertirla
    if (data.fechaHora && typeof data.fechaHora === 'string') {
      const newDate = new Date(data.fechaHora);
      if (isNaN(newDate.getTime())) {
        throw {
          status: 400,
          message: 'Formato de fecha inválido en actualización',
          code: 'INVALID_DATE_FORMAT',
        };
      }
      data.fechaHora = newDate;
    }

    Object.assign(appointment, data);
    const updated = await this.repository.save(appointment);

    // Publicar evento de auditoría
    await this.queueService.publish('audit.appointment.updated', updated);

    return updated;
  }

  async delete(id: string): Promise<void> {
    const appointment = await this.findById(id);
    if (!appointment) {
      throw { status: 404, message: 'Cita no encontrada', code: 'NOT_FOUND' };
    }

    appointment.estado = AppointmentStatus.CANCELADA;
    const cancelled = await this.repository.save(appointment);

    // Publicar evento de auditoría
    await this.queueService.publish('audit.appointment.deleted', cancelled);
  }
}
