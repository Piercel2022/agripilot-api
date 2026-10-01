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
import type { Crop } from '../../crops/entities/crop.entity.js';

@Entity('harvests')
export class Harvest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne('Crop', 'harvests', {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'crop_id' })
  crop!: Crop;

  @ManyToOne('Campaign', 'harvests', {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'campaign_id' })
  campaign!: Campaign;

  @Column({ type: 'date' })
  harvestDate!: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  quantity!: number;

  @Column({ length: 20 })
  unit!: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  yield?: number;

  @Column({ nullable: true, length: 100 })
  quality?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
