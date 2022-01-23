import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { AuthMiddleware } from '../user/auth.middleware';
import { User } from '../user/user.entity';
import { UserModule } from '../user/user.module';
import { ArticleController } from './article.controller';
import { Article } from './article.entity';
import { ArticleService } from './article.service';
import { Comment } from './comment.entity';

@Module({
  controllers: [
    ArticleController,
  ],
  imports: [MikroOrmModule.forFeature({ entities: [Article, Comment, User] }), UserModule],
  providers: [ArticleService],
})
export class ArticleModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'articles/feed', method: RequestMethod.GET },
        { path: 'articles', method: RequestMethod.POST },
        { path: 'articles/:slug', method: RequestMethod.DELETE },
        { path: 'articles/:slug', method: RequestMethod.PUT },
        { path: 'articles/:slug/comments', method: RequestMethod.POST },
        { path: 'articles/:slug/comments/:id', method: RequestMethod.DELETE },
        { path: 'articles/:slug/favorite', method: RequestMethod.POST },
        { path: 'articles/:slug/favorite', method: RequestMethod.DELETE });
  }
}
