import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../users/user.entity";

@Entity()
export class UserFile {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    type: string;

    @Column({ nullable: false, name: 'aws_key_name' })
    awsKeyName: string;

    @Column({ nullable: false })
    fileName: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
    createdAt: Date;  

    @ManyToOne(() => User, (user) => user.createdFiles)
    @JoinColumn({ name: 'user_id' })
    createdBy: User;
}