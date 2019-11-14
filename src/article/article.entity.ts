import { Collection, Entity, IdEntity, ManyToOne, OneToMany, PrimaryKey, Property, wrap } from 'mikro-orm';
import slug from 'slug';

import { User } from '../user/user.entity';
import { Comment } from './comment.entity';

@Entity()
export class Article implements IdEntity<Article> {

  @PrimaryKey()
  id: number;

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

  @Property() // TODO 'simple-array'?
  tagList: string[] = [];

  @ManyToOne()
  author: User;

  @OneToMany(() => Comment, comment => comment.article, { eager: true, orphanRemoval: true })
  comments = new Collection<Comment>(this);

  @Property()
  favoritesCount = 0;

  constructor(author: User, title: string, description: string, body: string) {
    this.author = author;
    this.title = title;
    this.description = description;
    this.body = body;
    this.slug = slug(title, { lower: true }) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36); // tslint:disable-line
  }

  toJSON(user?: User): Article {
    const o = wrap(this).toObject();
    o.favorited = user && user.favorites.isInitialized() ? user.favorites.contains(this) : false;
    o.author = this.author.toJSON(user);

    return o as Article;
  }

}
