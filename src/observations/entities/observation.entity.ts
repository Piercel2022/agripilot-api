import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { Field } from '../../fields/entities/field.entity.js';

export enum ObservationType {
  CROP = 'crop',
  SOIL = 'soil',
  PEST = 'pest',
  DISEASE = 'disease',
  WEATHER = 'weather',
  IRRIGATION = 'irrigation',
  GENERAL = 'general',
}

export enum ObservationSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('observations')
export class Observation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 150 })
  name!: string;

  @Column({
    type: 'enum',
    enum: ObservationType,
  })
  type!: ObservationType;

  @Column({ type: 'date', nullable: true })
  observedAt?: string;

  @Column({
    type: 'enum',
    enum: ObservationSeverity,
    nullable: true,
  })
  severity?: ObservationSeverity;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column({ nullable: true, type: 'text' })
  notes?: string;

  @ManyToOne('Field', 'observations', {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'field_id' })
  field!: Field;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
