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

import type { Organization } from '../../organizations/entities/organization.entity.js';
import type { Field } from '../../fields/entities/field.entity.js';

@Entity('farms')
export class Farm {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 150 })
  name!: string;

  @Column({ nullable: true, length: 255 })
  address?: string;

  @Column({ nullable: true, length: 100 })
  city?: string;

  @Column({ nullable: true, length: 20 })
  postalCode?: string;

  @Column({ nullable: true, length: 100 })
  country?: string;

  @ManyToOne('Organization', 'farms', {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;

  @OneToMany('Field', 'farm')
  fields!: Field[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}