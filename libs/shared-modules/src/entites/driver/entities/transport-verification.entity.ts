import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DriverTransport } from './driver-transport.entity';

@Entity()
export class TransportVerification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: false, name: 'bank_card_number' })
  bankCardNumber: string;

  @Column({ nullable: false, name: 'bank_name_of_card_number' })
  bankNameOfCardNumber: string;
  
  @Column({ nullable: false, name: 'transport_registration_state' })
  transportRegistrationState: string;

  @Column({ nullable: false, name: 'passport_selfies_photo_path' })
  passportSelfiePhotoPath: string;

  @Column({ nullable: false, name: 'drivers_license_photo_path' })
  driversLicensePhotoPath: string;

  @Column({ nullable: false, name: 'driver_license_front_photo_path' })
  transportFrontPhotoPath: string;

  @Column({ nullable: false, name: 'driver_license_back_photo_path' })
  transportBackPhotoPath: string;

  @Column({ nullable: false, name: 'transport_side_photo_path' })
  transportSidePhotoPath: string;

  @Column({ nullable: false, name: 'adr_photo_path' })
  adrPhotoPath: string;

  @Column({ nullable: false, name: 'tech_passport_back_photo_path' })
  techPassportFrontPhotoPath: string;

  @Column({ nullable: false, name: 'tech_passport_front_photo_path' })
  techPassportBackPhotoPath: string;

  @Column({ nullable: false, name: 'goods_transportation_license_card_photo_path' })
  goodsTransportationLicenseCardPhotoPath: string;

  @Column({ nullable: false, name: 'state_number' })
  stateNumber: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;  

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  verified: boolean;

  @Column({ default: false })
  rejected: boolean;

  @Column({ default: false })
  deleted: boolean;

  @OneToOne(() => DriverTransport, (driverTransport) => driverTransport.transportVerification)
  @JoinColumn({ name: 'driver_transport_id' })
  driverTransport: DriverTransport; 
}