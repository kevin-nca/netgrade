import {
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  VersionColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @VersionColumn()
  version!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  appInstanceId!: string | null;

  @BeforeInsert()
  setCreationDefaults(): void {
    this.appInstanceId = this.generateAppInstanceId();
  }

  @BeforeUpdate()
  updateDefaults(): void {
    this.appInstanceId = this.generateAppInstanceId();
  }

  private generateAppInstanceId(): string {
    // TODO: Use a real appInstanceId that depends on the user's device, the app version, the commit hash, etc.
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    return `customId-${randomSuffix}`;
  }
}
