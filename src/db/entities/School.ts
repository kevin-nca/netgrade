import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Semester } from './Semester';

@Entity('school')
export class School extends BaseEntity {
  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  address!: string | null;

  @Column({ type: 'varchar', nullable: true })
  type!: string | null;

  @OneToMany(() => Semester, (semester) => semester.school, { cascade: true })
  semesters!: Semester[];
}
