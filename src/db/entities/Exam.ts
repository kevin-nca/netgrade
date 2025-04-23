import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
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

  @ManyToOne(() => Subject, (subject) => subject.exams, {
    onDelete: 'CASCADE',
    eager: true
  })
  @JoinColumn({ name: 'subjectId' })
  subject!: Subject;

  @OneToMany(() => Grade, (grade) => grade.exam)
  grades!: Grade[];
}
