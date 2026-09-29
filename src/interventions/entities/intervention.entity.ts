import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { Campaign } from '../../campaigns/entities/campaign.entity.js';

export enum InterventionType {
  SOWING = 'sowing',
  FERTILIZATION = 'fertilization',
  PHYTOSANITARY = 'phytosanitary',
  IRRIGATION = 'irrigation',
  WEEDING = 'weeding',
  SOIL_WORK = 'soil_work',
  HARVEST = 'harvest',
  OBSERVATION = 'observation',
}

export enum InterventionStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('interventions')
export class Intervention {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 150 })
  name!: string;

  @Column({
    type: 'enum',
    enum: InterventionType,
  })
  type!: InterventionType;

  @Column({ type: 'date', nullable: true })
  scheduledDate?: string;

  @Column({ type: 'date', nullable: true })
  completedDate?: string;

  @Column({
    type: 'enum',
    enum: InterventionStatus,
    default: InterventionStatus.PLANNED,
  })
  status!: InterventionStatus;

  @Column({ nullable: true, type: 'text' })
  notes?: string;

  @ManyToOne('Campaign', 'interventions', {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'campaign_id' })
  campaign!: Campaign;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
