import { Article } from './article.entity';

interface IComment {
  body: string;
}

export interface ICommentsRO {
  comments: IComment[];
}

export interface IArticleRO {
  article: Article;
}

export interface IArticlesRO {
  articles: Article[];
  articlesCount: number;
}
