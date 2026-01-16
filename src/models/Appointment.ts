import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    VersionColumn,
  } from 'typeorm';
  
  export enum AppointmentStatus {
    AGENDADA = 'AGENDADA',
    COMPLETADA = 'COMPLETADA',
    CANCELADA = 'CANCELADA',
  }
  
  @Entity('appointments')
  export class Appointment {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @Column('uuid')
    pacienteId!: string;
  
    @Column('uuid')
    medicoId!: string;
  
    @Column('timestamp')
    fechaHora!: Date;
  
    @Column({ length: 500 })
    motivo!: string;
  
    @Column({
      type: 'enum',
      enum: AppointmentStatus,
      default: AppointmentStatus.AGENDADA,
    })
    estado!: AppointmentStatus;
  
    @VersionColumn()
    version!: number;
  
    @CreateDateColumn()
    createdAt!: Date;
  
    @UpdateDateColumn()
    updatedAt!: Date;
  }