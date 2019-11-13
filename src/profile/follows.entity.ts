import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('follows')
export class FollowsEntity {

  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public followerId: number;

  @Column()
  public followingId: number;

}
