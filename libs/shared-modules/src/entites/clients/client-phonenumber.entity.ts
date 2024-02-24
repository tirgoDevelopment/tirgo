import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Client } from "./client.entity";

@Entity()
export class ClientPhoneNumber {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ nullable: false, unique: true, name: 'phone_number' })
    phoneNumber: string;

    @ManyToOne(() => Client, client => client.phoneNumbers)
    client: Client;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
    createdAt: Date;  
}