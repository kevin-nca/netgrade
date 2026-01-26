import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Subject } from './Subject';

@Entity('school')
export class School extends BaseEntity {
  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  address!: string | null;

  @Column({ type: 'varchar', nullable: true })
  type!: string | null;

  @OneToMany(() => Subject, (subject) => subject.school)
  subjects!: Subject[];
}
