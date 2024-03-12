import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class LocationPlace {
  @PrimaryGeneratedColumn('increment')
  id?: number;

  @Column({ nullable: false })
  name: string;
  
  @Column({ nullable: false })
  latitude: string;
  
  @Column({ nullable: false })
  longitude: string;

}