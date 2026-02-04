import { Entity, Column, OneToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Exam } from './Exam';
import { dateTransformer } from '../utils';

@Entity('grade')
export class Grade extends BaseEntity {
  @Column({ type: 'float' })
  score!: number;

  @Column({ type: 'float', default: 1.0 })
  weight!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  comment!: string | null;

  @Column({
    type: 'date',
    transformer: dateTransformer,
  })
  date!: Date;

  @Column({ type: 'uuid', nullable: true })
  examId!: string | null;

  @OneToOne(() => Exam, (exam) => exam.grade, {
    nullable: false,
  })
  exam!: Exam;
}
