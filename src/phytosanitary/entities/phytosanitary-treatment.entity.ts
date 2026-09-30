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

export enum TreatmentType {
  FUNGICIDE = 'fungicide',
  HERBICIDE = 'herbicide',
  INSECTICIDE = 'insecticide',
  ACARICIDE = 'acaricide',
  MOLLUSCICIDE = 'molluscicide',
  BIOCONTROL = 'biocontrol',
  OTHER = 'other',
}

export enum TreatmentUnit {
  LITER = 'liter',
  KG = 'kg',
  LITER_PER_HECTARE = 'liter_per_hectare',
  KG_PER_HECTARE = 'kg_per_hectare',
  OTHER = 'other',
}

export enum ApplicationMethod {
  FOLIAR = 'foliar',
  SOIL = 'soil',
  SEED_TREATMENT = 'seed_treatment',
  LOCALIZED = 'localized',
  OTHER = 'other',
}

export enum PhytosanitaryStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('phytosanitary_treatments')
export class PhytosanitaryTreatment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 150 })
  name!: string;

  @Column({ length: 150 })
  product!: string;

  @Column({ length: 150, nullable: true })
  activeIngredient?: string;

  @Column({
    type: 'enum',
    enum: TreatmentType,
  })
  treatmentType!: TreatmentType;

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
  dose?: string;

  @Column({
    type: 'enum',
    enum: TreatmentUnit,
    nullable: true,
  })
  unit?: TreatmentUnit;

  @Column({ length: 150, nullable: true })
  target?: string;

  @Column({
    type: 'enum',
    enum: ApplicationMethod,
    nullable: true,
  })
  applicationMethod?: ApplicationMethod;

  @Column({
    type: 'enum',
    enum: PhytosanitaryStatus,
    default: PhytosanitaryStatus.PLANNED,
  })
  status!: PhytosanitaryStatus;

  @Column({ nullable: true, type: 'text' })
  notes?: string;

  @ManyToOne('Intervention', 'phytosanitaryTreatments', {
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
