import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Subject } from './Subject';

@Entity('semester')
export class Semester extends BaseEntity {
  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ type: 'date' })
  endDate!: Date;

  @OneToMany(() => Subject, (subject) => subject.semester)
  subjects!: Subject[];
}
