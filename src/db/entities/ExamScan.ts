import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Exam } from './Exam';

@Entity('exam_scan')
export class ExamScan extends BaseEntity {
  @Column({ type: 'uuid' })
  examId!: string;

  @Column({ type: 'varchar', length: 255 })
  photoPath!: string;

  @ManyToOne(() => Exam, (exam) => exam.scans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'examId' })
  exam!: Exam;
}
