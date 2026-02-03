import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Subject } from './Subject';

@Entity('semester')
export class Semester extends BaseEntity {
  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'text' })
  startDate!: string;

  @Column({ type: 'text' })
  endDate!: string;

  @OneToMany(() => Subject, (subject) => subject.semester)
  subjects!: Subject[];
}
