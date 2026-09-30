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

export enum FertilisationType {
  ORGANIC = 'organic',
  MINERAL = 'mineral',
  NITROGEN = 'nitrogen',
  PHOSPHORUS = 'phosphorus',
  POTASSIUM = 'potassium',
  NPK = 'npk',
  OTHER = 'other',
}

export enum FertilisationUnit {
  KG = 'kg',
  TONNE = 'tonne',
  LITER = 'liter',
  KG_PER_HECTARE = 'kg_per_hectare',
}

export enum FertilisationApplicationMethod {
  BROADCAST = 'broadcast',
  LOCALIZED = 'localized',
  FOLIAR = 'foliar',
  FERTIGATION = 'fertigation',
  OTHER = 'other',
}

export enum FertilisationStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('fertilisations')
export class Fertilisation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 150 })
  name!: string;

  @Column({ length: 150 })
  product!: string;

  @Column({
    type: 'enum',
    enum: FertilisationType,
  })
  type!: FertilisationType;

  @Column({ type: 'date', nullable: true })
  scheduledDate?: string;

  @Column({ type: 'date', nullable: true })
  completedDate?: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  quantity?: string;

  @Column({
    type: 'enum',
    enum: FertilisationUnit,
    nullable: true,
  })
  unit?: FertilisationUnit;

  @Column({
    type: 'enum',
    enum: FertilisationApplicationMethod,
    nullable: true,
  })
  applicationMethod?: FertilisationApplicationMethod;

  @Column({
    type: 'enum',
    enum: FertilisationStatus,
    default: FertilisationStatus.PLANNED,
  })
  status!: FertilisationStatus;

  @Column({ nullable: true, type: 'text' })
  notes?: string;

  @ManyToOne('Intervention', 'fertilisations', {
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
