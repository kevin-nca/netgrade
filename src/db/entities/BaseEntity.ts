import {
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  VersionColumn,
} from 'typeorm';

import { AppInfo } from '@/AppInfo';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @VersionColumn()
  version!: number;

  @Column({ type: 'varchar', length: 255 })
  appInstanceId!: string;

  @BeforeInsert()
  setCreationDefaults(): void {
    this.appInstanceId = this.generateAppInstanceId();
  }

  @BeforeUpdate()
  updateDefaults(): void {
    this.appInstanceId = this.generateAppInstanceId();
  }

  private generateAppInstanceId(): string {
    return AppInfo.getAppInstanceId();
  }
}
