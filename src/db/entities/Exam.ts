import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Subject } from './Subject';
import { Grade } from './Grade';
import { dateTransformer } from '../utils';

@Entity('exam')
export class Exam extends BaseEntity {
  @Column({ type: 'varchar' })
  name!: string;

  @Column({
    type: 'date',
    transformer: dateTransformer,
  })
  date!: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description!: string | null;

  @Column({ type: 'float', nullable: true })
  weight!: number | null;

  @Column({ type: 'boolean', default: false })
  isCompleted!: boolean;

  @Column({ type: 'uuid' })
  subjectId!: string;

  @ManyToOne(() => Subject, (subject) => subject.exams, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subjectId' })
  subject!: Subject;

  @Column({ type: 'uuid', nullable: true })
  gradeId!: string | null;

  @OneToOne(() => Grade, (grade) => grade.exam, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'gradeId' })
  grade!: Grade | null;
}
