import { ArticleDTO } from './article.entity';

interface IComment {
  body: string;
}

export interface ICommentsRO {
  comments: IComment[];
}

export interface IArticleRO {
  article: ArticleDTO;
}

export interface IArticlesRO {
  articles: ArticleDTO[];
  articlesCount: number;
}
