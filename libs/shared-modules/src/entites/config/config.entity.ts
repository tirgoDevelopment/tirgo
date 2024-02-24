import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Config {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ nullable: true })
  smsToken: string;

  @Column({ default: true })
  active?: boolean;
  
  @Column({ default: false })
  disabled?: boolean;
}
