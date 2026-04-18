import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'Droguerie Paris Central' })
  storeName: string;

  @Column({ default: 'support@droguerie.com' })
  supportEmail: string;

  @Column({ default: '+33 1 23 45 67 89' })
  phoneNumber: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
