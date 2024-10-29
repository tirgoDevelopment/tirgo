import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TelegramBotUser {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true, name: 'first_name' })
  firstName: string;

  @Column({ nullable: true, name: 'last_name' })
  lastName: string;

  @Column({ nullable: true, name: 'phone_number' })
  phoneNumber: string;

  @Column({ nullable: false, name: 'tg_username' })
  tgUsername: string;

  @Column({ nullable: false, name: 'tg_chat_id' })
  tgChatId: number;

  @CreateDateColumn({ name: 'created_at',  default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @Column({ default: true })
  active?: boolean;
}
