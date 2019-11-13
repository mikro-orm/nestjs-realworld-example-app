import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as slugRequire from 'slug';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import { FollowsEntity } from '../profile/follows.entity';
import { UserEntity } from '../user/user.entity';
import { ArticleEntity } from './article.entity';
import { IArticleRO, IArticlesRO, ICommentsRO } from './article.interface';
import { Comment } from './comment.entity';
import { CreateArticleDto } from './dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowsEntity)
    private readonly followsRepository: Repository<FollowsEntity>,
  ) {}

  public async findAll(query): Promise<IArticlesRO> {
    const qb = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author');

    qb.where('1 = 1');

    if ('tag' in query) {
      qb.andWhere('article.tagList LIKE :tag', { tag: `%${query.tag}%` });
    }

    if ('author' in query) {
      const author = await this.userRepository.findOne({ username: query.author });

      if (!author) {
        return { articles: [], articlesCount: 0 };
      }

      qb.andWhere('article.authorId = :id', { id: author.id });
    }

    if ('favorited' in query) {
      const author = await this.userRepository.findOne({ username: query.favorited });
      if (!author) {
        return { articles: [], articlesCount: 0 };
      }
      const ids = author.favorites.map((el) => el.id);
      qb.andWhere('article.authorId IN (:ids)', { ids });
    }

    qb.orderBy('article.createdAt', 'DESC');

    const articlesCount = await qb.getCount();

    if ('limit' in query) {
      qb.limit(query.limit);
    }

    if ('offset' in query) {
      qb.offset(query.offset);
    }

    const articles = await qb.getMany();
    this.protectAuthors(articles);

    return { articles, articlesCount };
  }

  public async findFeed(userId: number, query): Promise<IArticlesRO> {
    const follows = await this.followsRepository.find({ followerId: userId });
    const ids = follows.map((el) => el.followingId);

    const qb = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .where('article.authorId IN (:ids)', { ids });

    qb.orderBy('article.createdAt', 'DESC');

    const articlesCount = await qb.getCount();

    if ('limit' in query) {
      qb.limit(query.limit);
    }

    if ('offset' in query) {
      qb.offset(query.offset);
    }

    const articles = await qb.getMany();
    this.protectAuthors(articles);

    return { articles, articlesCount };
  }

  public async findOne(where): Promise<IArticleRO> {
    const article = await this.articleRepository.findOne({ ...where, relations: ['author'] });
    this.protectAuthor(article);
    return { article };
  }

  public async addComment(userId: number, slug: string, commentData) {
    let article = await this.articleRepository.findOne({ slug, relations: ['author'] });
    const author = await this.userRepository.findOne(userId);
    this.protectAuthor(article);

    const comment = new Comment();
    comment.body = commentData.body;
    comment.author = author;
    article.comments.push(comment);

    await this.commentRepository.save(comment);
    article = await this.articleRepository.save(article);
    return { comment, article };
  }

  public async deleteComment(slug: string, id: string): Promise<IArticleRO> {
    let article = await this.articleRepository.findOne({ slug, relations: ['author'] });
    this.protectAuthor(article);

    const comment = await this.commentRepository.findOne(id);
    const deleteIndex = article.comments.findIndex((candidate) => candidate.id === comment.id);

    if (deleteIndex >= 0) {
      const deleteComments = article.comments.splice(deleteIndex, 1);
      await this.commentRepository.delete(deleteComments[0].id);
      article = await this.articleRepository.save(article);
      return { article };
    } else {
      return { article } ;
    }
  }

  public async favorite(id: number, slug: string): Promise<IArticleRO> {
    let article = await this.articleRepository.findOne({ slug, relations: ['author'] });
    this.protectAuthor(article);
    const user = await this.userRepository.findOne(id);

    const isNewFavorite = user && user.favorites && user.favorites.findIndex((candidate) => candidate.id === article.id) < 0;
    if (isNewFavorite) {
      user.favorites.push(article);
      article.favoritesCount++;
      await this.userRepository.save(user);
      article = await this.articleRepository.save(article);
    }

    return { article };
  }

  public async unFavorite(id: number, slug: string): Promise<IArticleRO> {
    let article = await this.articleRepository.findOne({ slug, relations: ['author'] });
    this.protectAuthor(article);
    const user = await this.userRepository.findOne(id);

    const deleteIndex = user && user.favorites && user.favorites.findIndex((candidate) => candidate.id === article.id);

    if (deleteIndex >= 0) {
      user.favorites.splice(deleteIndex, 1);
      article.favoritesCount--;
      await this.userRepository.save(user);
      article = await this.articleRepository.save(article);
    }

    return { article };
  }

  public async findComments(slug: string): Promise<ICommentsRO> {
    const article = await this.articleRepository.findOne({ slug, relations: ['comments'] });
    this.protectAuthor(article);
    return { comments: article.comments };
  }

  public async create(userId: number, articleData: CreateArticleDto) {
    const article = new ArticleEntity();
    article.title = articleData.title;
    article.description = articleData.description;
    article.body = articleData.body;
    article.slug = this.slugify(articleData.title);
    article.tagList = articleData.tagList || [];
    article.comments = [];

    const newArticle = await this.articleRepository.save(article);
    this.protectAuthor(newArticle);

    const author = await this.userRepository.findOne({ where: { id: userId }, relations: ['articles'] });

    if (Array.isArray(author.articles)) {
      author.articles.push(article);
    } else {
      author.articles = [article];
    }

    await this.userRepository.save(author);
    return { article: newArticle };
  }

  public async update(slug: string, articleData: any): Promise<IArticleRO> {
    const toUpdate = await this.articleRepository.findOne({ slug, relations: ['author'] });
    const updated = { ...toUpdate, articleData };
    const article = await this.articleRepository.save(updated);
    this.protectAuthor(article);
    return { article };
  }

  public async delete(slug: string): Promise<DeleteResult> {
    return this.articleRepository.delete({ slug });
  }

  private slugify(title: string) {
    return slugRequire(title, { lower: true }) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36); // tslint:disable-line
  }

  private protectAuthor(article: any) {
    if (article && article.author) {
      if (article.author.password) {
        delete article.author.password;
      }
      if (article.author.email) {
        delete article.author.email;
      }
    }
  }

  private protectAuthors(articles: any[]) {
    articles.forEach((article) => {
      this.protectAuthor(article);
    });
  }
}
