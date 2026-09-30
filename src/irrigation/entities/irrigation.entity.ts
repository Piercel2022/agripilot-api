import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { Intervention } from '../../interventions/entities/intervention.entity.js';

export enum IrrigationMethod {
  DRIP = 'drip',
  SPRINKLER = 'sprinkler',
  PIVOT = 'pivot',
  FLOOD = 'flood',
  MANUAL = 'manual',
  OTHER = 'other',
}

export enum IrrigationStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('irrigations')
export class Irrigation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 150 })
  name!: string;

  @Column({
    type: 'enum',
    enum: IrrigationMethod,
  })
  method!: IrrigationMethod;

  @Column({ type: 'date', nullable: true })
  scheduledDate?: string;

  @Column({ type: 'date', nullable: true })
  completedDate?: string;

  @Column({ type: 'int', nullable: true })
  durationMinutes?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  waterVolumeLiters?: string;

  @Column({
    type: 'enum',
    enum: IrrigationStatus,
    default: IrrigationStatus.PLANNED,
  })
  status!: IrrigationStatus;

  @Column({ nullable: true, type: 'text' })
  notes?: string;

  @ManyToOne('Intervention', 'irrigations', {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'intervention_id' })
  intervention!: Intervention;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
