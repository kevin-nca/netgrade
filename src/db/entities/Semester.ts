import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@/db/entities/BaseEntity';
import { School } from './School';
import { Subject } from './Subject';

@Entity('semester')
export class Semester extends BaseEntity {
  @Column({ type: 'varchar' })
  year!: string;

  @Column({ type: 'uuid' })
  schoolId!: string;

  @ManyToOne(() => School, (school) => school.semesters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'schoolId' })
  school!: School;

  @OneToMany(() => Subject, (subject) => subject.semester)
  subjects!: Subject[];
}
