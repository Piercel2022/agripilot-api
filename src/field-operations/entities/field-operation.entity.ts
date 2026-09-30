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

export enum FieldOperationStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('field_operations')
export class FieldOperation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne('Intervention', 'fieldOperations', {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'intervention_id' })
  intervention!: Intervention;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  startedAt?: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  completedAt?: Date;

  @Column({
    type: 'integer',
    nullable: true,
  })
  durationMinutes?: number;

  @Column({
    type: 'enum',
    enum: FieldOperationStatus,
    default: FieldOperationStatus.PLANNED,
  })
  status!: FieldOperationStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
