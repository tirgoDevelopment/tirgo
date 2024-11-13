import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Client } from "./client.entity";
import { User } from "../users/user.entity";

@Entity()
export class ClientPhoneNumber {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ nullable: false })
    number: string;
    
    @Column({ nullable: false })
    code: number;
    
    @Column({ nullable: true, name: 'is_main' })
    isMain: boolean;
    
    @Column({ nullable: true, name: 'is_active' })
    isActive: boolean;
    
    @Column({ nullable: true, name: 'verification_code' })
    verificationCode: number;
    
    @Column({ nullable: true, name: 'verification_code_exp_datetime', type: 'bigint' })
    verificationCodeExpDatetime: bigint;

    @Column({ nullable: true, name: 'is_verified' })
    isVerified: boolean;
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
    createdAt: Date;
    
    @ManyToOne(() => User, (user) => user.createdDriverPhoneNumbers, { nullable: true })
    @JoinColumn({ name: 'created_by_id' })
    createdBy: User;
    
    @Column({ nullable: true, name: 'is_deleted' })
    isDeleted: boolean;
    
    @Column({ nullable: true, type: 'timestamp', name: 'deleted_at' })
    deletedAt: Date;
    
    @ManyToOne(() => User, (user) => user.deletedDriverPhoneNumbers, { nullable: true })
    @JoinColumn({ name: 'deleted_by_id' })
    deletedBy: User;

    @ManyToOne(() => Client, client => client.phoneNumbers)
    client: Client;
}