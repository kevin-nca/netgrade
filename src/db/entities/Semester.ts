import { Column, Entity, OneToMany, ValueTransformer } from 'typeorm';
import { Temporal } from '@js-temporal/polyfill';
import { BaseEntity } from './BaseEntity';
import { Subject } from './Subject';

const TemporalDateTransformer: ValueTransformer = {
  to(value: Temporal.PlainDate): Date {
    return new Date(value.toString());
  },

  from(value: Date | string): string {
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    return value;
  },
};

@Entity('semester')
export class Semester extends BaseEntity {
  @Column({ type: 'varchar' })
  name!: string;

  @Column({
    type: 'date',
    transformer: TemporalDateTransformer,
  })
  startDate!: string;

  @Column({
    type: 'date',
    transformer: TemporalDateTransformer,
  })
  endDate!: string;

  @OneToMany(() => Subject, (subject) => subject.semester)
  subjects!: Subject[];
}
