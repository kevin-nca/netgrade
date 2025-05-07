import {
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  VersionColumn,
} from 'typeorm';

import { AppInfoService } from '@/services/AppInfoService';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @VersionColumn()
  version!: number;

  @Column({ type: 'varchar', nullable: true })
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
    return AppInfoService.getInstance().getAppInstanceId();
  }
}
