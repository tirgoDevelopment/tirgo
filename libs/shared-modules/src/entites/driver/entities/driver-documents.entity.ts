import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from '../../users/user.entity';

@Entity()
export class DriverDocuments {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    bucket: string;

    @Column({ nullable: false, name: 'mime_type' })
    mimeType: string;

    @Column({ nullable: false })
    size: string;

    @Column({ nullable: false, name: 'doc_type' })
    docType: string;

    @Column({ nullable: true, name: 'file_hash' })
    fileHash: string;

    @Column({ nullable: false, name: 'driver_id' })
    driverId: number;

    @Column({ nullable: true })
    description: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
    createdAt: Date;
    
    @ManyToOne(() => User, (user) => user.createdDriverPhoneNumbers, { nullable: true })
    @JoinColumn({ name: 'created_by_id' })
    createdBy: User;
    
    @Column({ nullable: true, name: 'is_deleted' })
    isDeleted: boolean;
    
    @Column({ nullable: true, type: 'timestamp', name: 'deleted_at' })
    deletedAt: Date;
    
    @ManyToOne(() => User, (user) => user.deletedDriverDocuments, { nullable: true })
    @JoinColumn({ name: 'deleted_by_id' })
    deletedBy: User;

    @Column({ nullable: true, type: 'timestamp', name: 'update_at' })
    updateAt: Date;
    
    @ManyToOne(() => User, (user) => user.updatedDriverDocuments, { nullable: true })
    @JoinColumn({ name: 'updated_by_id' })
    updatedBy: User;
}