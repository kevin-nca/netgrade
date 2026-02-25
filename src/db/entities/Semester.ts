import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { School } from './School';
import { Subject } from './Subject';

@Entity('semester')
export class Semester extends BaseEntity {
  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ type: 'date' })
  endDate!: Date;

  @Column({ type: 'uuid' })
  schoolId!: string;

  @ManyToOne(() => School, (school) => school.semesters, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'schoolId' })
  school!: School;

  @OneToMany(() => Subject, (subject) => subject.semester)
  subjects!: Subject[];
}
