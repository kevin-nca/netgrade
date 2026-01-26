import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { School } from './School';
import { Exam } from './Exam';
import { Semester } from '@/db/entities/Semester';

@Entity('subject')
export class Subject extends BaseEntity {
  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  teacher!: string | null;

  @Column({ type: 'float', default: 1.0 })
  weight!: number;

  @Column({ type: 'uuid' })
  schoolId!: string;

  @Column({ type: 'uuid' })
  semesterId!: string;

  @ManyToOne(() => Semester, (semester) => semester.subjects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'semesterId' })
  semester!: Semester | null;

  @ManyToOne(() => School, (school) => school.subjects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'schoolId' })
  school!: School;

  @OneToMany(() => Exam, (exam) => exam.subject)
  exams!: Exam[];
}
