import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { EntityName, type LazyRef, type Rel } from '@mikro-orm/core';
import { User } from '../user/user.entity';
import { Article } from './article.entity';

@Entity()
export class Comment {
  [EntityName]?: 'Comment';

  @PrimaryKey()
  id!: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property()
  body: string;

  @ManyToOne()
  article!: LazyRef<Article>;

  @ManyToOne()
  author!: LazyRef<User>;

  constructor(author: Rel<User>, article: Rel<Article>, body: string) {
    this.author = author;
    this.article = article;
    this.body = body;
  }
}
