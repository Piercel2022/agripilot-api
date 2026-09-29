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

export enum CropStatus {
  PLANNED = 'planned',
  ACTIVE = 'active',
  HARVESTED = 'harvested',
  CANCELLED = 'cancelled',
}

@Entity('crops')
export class Crop {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 150 })
  name!: string;

  @Column({ nullable: true, length: 150 })
  variety?: string;

  @Column({ nullable: true, length: 50 })
  season?: string;

  @Column({ type: 'date', nullable: true })
  sowingDate?: string;

  @Column({ type: 'date', nullable: true })
  harvestDate?: string;

  @Column({
    type: 'enum',
    enum: CropStatus,
    default: CropStatus.PLANNED,
  })
  status!: CropStatus;

  @Column({ nullable: true, type: 'text' })
  notes?: string;

  @ManyToOne('Field', 'crops', {
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
