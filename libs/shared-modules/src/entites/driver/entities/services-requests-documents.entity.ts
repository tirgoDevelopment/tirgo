import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from '../../users/user.entity';
import { DriversServicesRequestsMessages } from "./drivers-services-requests-messages.entity";

@Entity()
export class ServicesRequestsDocuments {
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

    @OneToOne(() => DriversServicesRequestsMessages, (message) => message.file, { nullable: false })
    @JoinColumn({ name: 'message_id' })
    message: DriversServicesRequestsMessages;

    @Column({ nullable: true })
    description: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
    createdAt: Date;
    
    @ManyToOne(() => User, (user) => user.createdServicesRequestsDocuments, { nullable: true })
    @JoinColumn({ name: 'created_by_id' })
    createdBy: User;
    
    @Column({ nullable: true, name: 'is_deleted' })
    isDeleted: boolean;
    
    @Column({ nullable: true, type: 'timestamp', name: 'deleted_at' })
    deletedAt: Date;
    
    @ManyToOne(() => User, (user) => user.deletedServicesRequestsDocuments, { nullable: true })
    @JoinColumn({ name: 'deleted_by_id' })
    deletedBy: User;

    @Column({ nullable: true, type: 'timestamp', name: 'update_at' })
    updateAt: Date;
    
    @ManyToOne(() => User, (user) => user.updatedServicesRequestsDocuments, { nullable: true })
    @JoinColumn({ name: 'updated_by_id' })
    updatedBy: User;
}