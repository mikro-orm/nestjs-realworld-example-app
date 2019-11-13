import { BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { Comment } from './comment.entity';

@Entity('article')
export class ArticleEntity {

  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public slug: string;

  @Column()
  public title: string;

  @Column({ default: '' })
  public description: string;

  @Column({ default: '' })
  public body: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public updatedAt: Date;

  @Column('simple-array')
  public tagList: string[];

  @ManyToOne((type) => UserEntity, (user) => user.articles)
  public author: UserEntity;

  @OneToMany((type) => Comment, (comment) => comment.article, { eager: true })
  @JoinColumn()
  public comments: Comment[];

  @Column({ default: 0 })
  public favoritesCount: number;

  public favorited = false;

  @BeforeUpdate()
  public updateTimestamp() {
    this.updatedAt = new Date();
  }
}
