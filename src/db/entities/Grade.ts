import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
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

  @OneToOne(() => Exam, (exam) => exam.grade, {
    nullable: false,
  })
  @JoinColumn({ name: 'examId' })
  exam!: Exam;
}
