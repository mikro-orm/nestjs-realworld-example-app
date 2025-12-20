import { ArrayType, Collection, type EntityDTO, type Rel, wrap } from '@mikro-orm/mysql';
import { Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import slug from 'slug';

import { User } from '../user/user.entity';
import { Comment } from './comment.entity';

@Entity()
export class Article {
  @PrimaryKey()
  id!: number;

  @Property()
  slug: string;

  @Property()
  title: string;

  @Property()
  description = '';

  @Property()
  body = '';

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property({ type: ArrayType })
  tagList: string[] = [];

  @ManyToOne()
  author: Rel<User>;

  @OneToMany(() => Comment, comment => comment.article, { eager: true, orphanRemoval: true })
  comments = new Collection<Comment>(this);

  @Property()
  favoritesCount = 0;

  constructor(author: Rel<User>, title: string, description: string, body: string) {
    this.author = author;
    this.title = title;
    this.description = description;
    this.body = body;
    this.slug = slug(title, { lower: true }) + '-' + ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
  }

  toJSON(user?: Rel<User>) {
    const o = wrap<Article>(this).toObject() as ArticleDTO;
    o.favorited = user && user.favorites.isInitialized() ? user.favorites.contains(this) : false;
    o.author = this.author.toJSON(user);

    return o;
  }
}

export interface ArticleDTO extends EntityDTO<Article> {
  favorited?: boolean;
}
