import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Driver } from "./driver.entity";

@Entity()
export class DriverPhoneNumber {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ nullable: false, unique: true, name: 'phone_number' })
    phoneNumber: string;

    @ManyToOne(() => Driver, driver => driver.phoneNumbers)
    driver: Driver;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
    createdAt: Date;  
}