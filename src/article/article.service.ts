import { Injectable } from '@nestjs/common';
import { EntityManager, EntityRepository, FilterQuery, type Loaded } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';

import { User } from '../user/user.entity';
import { Article } from './article.entity';
import { IArticleRO, IArticlesRO, ICommentsRO } from './article.interface';
import { Comment } from './comment.entity';
import { CreateArticleDto, CreateCommentDto } from './dto';

type Viewer = Loaded<User, 'followers' | 'favorites'>;

@Injectable()
export class ArticleService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Article)
    private readonly articleRepository: EntityRepository<Article>,
    @InjectRepository(Comment)
    private readonly commentRepository: EntityRepository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  async findAll(userId: number, query: any): Promise<IArticlesRO> {
    const user = userId
      ? await this.userRepository.findOneOrFail(userId, { populate: ['followers', 'favorites'] })
      : undefined;
    const where: FilterQuery<Article> = {};

    if ('tag' in query) {
      where.tagList = new RegExp(query.tag);
    }

    if ('author' in query) {
      where.author = { username: query.author };
    }

    if ('favorited' in query) {
      const favoritingUser = await this.userRepository.findOne({ username: query.favorited }, { populate: ['favorites'] });

      if (!favoritingUser) {
        return { articles: [], articlesCount: 0 };
      }

      where.id = favoritingUser.favorites.$.getIdentifiers();
    }

    const [articles, articlesCount] = await this.articleRepository.findAndCount(where, {
      populate: ['author'],
      orderBy: { createdAt: 'desc' },
      limit: query.limit,
      offset: query.offset,
    });

    return { articles: articles.map(a => a.toJSON(user)), articlesCount };
  }

  async findFeed(user: Viewer, query: any): Promise<IArticlesRO> {
    const [articles, articlesCount] = await this.articleRepository.findAndCount(
      { author: { followers: user } },
      {
        populate: ['author'],
        orderBy: { createdAt: 'desc' },
        limit: query.limit,
        offset: query.offset,
      },
    );

    return { articles: articles.map(a => a.toJSON(user)), articlesCount };
  }

  async findOne(userId: number, where: FilterQuery<Article>): Promise<IArticleRO> {
    const user = userId
      ? await this.userRepository.findOneOrFail(userId, { populate: ['followers', 'favorites'] })
      : undefined;
    const article = await this.articleRepository.findOneOrFail(where, { populate: ['author'] });
    return { article: article.toJSON(user) };
  }

  async addComment(user: Viewer, slug: string, dto: CreateCommentDto) {
    const article = await this.articleRepository.findOneOrFail({ slug }, { populate: ['author'] });
    const comment = new Comment(user, article, dto.body);
    article.comments.add(comment);
    await this.em.flush();

    return { comment, article: article.toJSON(user) };
  }

  async deleteComment(user: Viewer, slug: string, id: number): Promise<IArticleRO> {
    const article = await this.articleRepository.findOneOrFail({ slug }, { populate: ['author'] });
    const comment = this.commentRepository.getReference(id);

    if (article.comments.contains(comment)) {
      article.comments.remove(comment);
      await this.em.remove(comment).flush();
    }

    return { article: article.toJSON(user) };
  }

  async favorite(user: Viewer, slug: string): Promise<IArticleRO> {
    const article = await this.articleRepository.findOneOrFail({ slug }, { populate: ['author'] });

    if (!user.favorites.contains(article)) {
      user.favorites.add(article);
      article.favoritesCount++;
    }

    await this.em.flush();
    return { article: article.toJSON(user) };
  }

  async unFavorite(user: Viewer, slug: string): Promise<IArticleRO> {
    const article = await this.articleRepository.findOneOrFail({ slug }, { populate: ['author'] });

    if (user.favorites.contains(article)) {
      user.favorites.remove(article);
      article.favoritesCount--;
    }

    await this.em.flush();
    return { article: article.toJSON(user) };
  }

  async findComments(slug: string): Promise<ICommentsRO> {
    const article = await this.articleRepository.findOneOrFail({ slug }, { populate: ['comments'] });
    return { comments: article.comments.getItems() };
  }

  async create(user: Viewer, dto: CreateArticleDto) {
    const author = await this.em.populate(user, ['articles']);
    const article = new Article(author, dto.title, dto.description, dto.body);
    article.tagList.push(...dto.tagList);
    author.articles.add(article);
    await this.em.flush();
    const loaded = await this.em.populate(article, ['author']);

    return { article: loaded.toJSON(author) };
  }

  async update(user: Viewer, slug: string, articleData: any): Promise<IArticleRO> {
    const article = await this.articleRepository.findOneOrFail({ slug }, { populate: ['author'] });
    this.em.assign(article, articleData);
    await this.em.flush();

    return { article: article.toJSON(user) };
  }

  async delete(slug: string) {
    return this.articleRepository.nativeDelete({ slug });
  }
}
