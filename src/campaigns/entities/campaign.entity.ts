import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { Crop } from '../../crops/entities/crop.entity.js';
import type { Intervention } from '../../interventions/entities/intervention.entity.js';

export enum CampaignStatus {
  PLANNED = 'planned',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 150 })
  name!: string;

  @Column({ length: 50 })
  season!: string;

  @Column({ type: 'date', nullable: true })
  startDate?: string;

  @Column({ type: 'date', nullable: true })
  endDate?: string;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.PLANNED,
  })
  status!: CampaignStatus;

  @Column({ nullable: true, type: 'text' })
  notes?: string;

  @ManyToOne('Crop', 'campaigns', {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'crop_id' })
  crop!: Crop;

  @OneToMany('Intervention', 'campaign')
  interventions!: Intervention[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
