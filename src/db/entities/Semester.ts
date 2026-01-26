import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '@/db/entities/BaseEntity';
import { Subject } from './Subject';
import { dateTransformer } from '@/db/utils';

@Entity('semester')
export class Semester extends BaseEntity {
  @Column({ type: 'varchar' })
  year!: string;

  @Column({
    type: 'date',
    transformer: dateTransformer,
  })
  startDate!: Date;

  @Column({
    type: 'date',
    transformer: dateTransformer,
  })
  endDate!: Date;

  @OneToMany(() => Subject, (subject) => subject.semester)
  subjects!: Subject[];
}
