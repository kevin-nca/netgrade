import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { School } from './School';
import { Exam } from './Exam';

@Entity('subject')
export class Subject extends BaseEntity {
  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  teacher!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description!: string | null;

  @Column({ type: 'float', default: 1.0 })
  weight!: number;

  @Column({ type: 'uuid' })
  schoolId!: string;

  @ManyToOne(() => School, (school) => school.subjects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'schoolId' })
  school!: School;

  @OneToMany(() => Exam, (exam) => exam.subject)
  exams!: Exam[];
}
