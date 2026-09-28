import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { Farm } from '../../farms/entities/farm.entity.js';

@Entity('fields')
export class Field {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 150 })
  name!: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  areaHectares!: number;

  @Column({ nullable: true, length: 100 })
  soilType?: string;

  @Column({ nullable: true, length: 100 })
  cropType?: string;

  @Column({ nullable: true, type: 'text' })
  notes?: string;

 @ManyToOne('Farm', 'fields', {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'farm_id' })
  farm!: Farm;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}