import { ArticleEntity } from './article.entity';

interface IComment {
  body: string;
}

export interface ICommentsRO {
  comments: IComment[];
}

export interface IArticleRO {
  article: ArticleEntity;
}

export interface IArticlesRO {
  articles: ArticleEntity[];
  articlesCount: number;
}
