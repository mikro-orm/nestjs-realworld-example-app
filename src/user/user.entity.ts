import { IsEmail } from 'class-validator';
import * as crypto from 'crypto';
import { BeforeInsert, Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ArticleEntity } from '../article/article.entity';

@Entity('user')
export class UserEntity {

  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public username: string;

  @Column()
  @IsEmail()
  public email: string;

  @Column({ default: '' })
  public bio: string;

  @Column({ default: '' })
  public image: string;

  @Column()
  public password: string;

  @ManyToMany((type) => ArticleEntity)
  @JoinTable()
  public favorites: ArticleEntity[];

  @OneToMany((type) => ArticleEntity, (article) => article.author)
  public articles: ArticleEntity[];

  @BeforeInsert()
  public hashPassword() {
    this.password = crypto.createHmac('sha256', this.password).digest('hex');
  }
}
