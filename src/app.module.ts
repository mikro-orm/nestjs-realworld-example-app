import { Module, OnModuleInit } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/mysql';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { AppController } from './app.controller';
import { ArticleModule } from './article/article.module';
import { ProfileModule } from './profile/profile.module';
import { TagModule } from './tag/tag.module';
import { UserModule } from './user/user.module';

@Module({
  controllers: [
    AppController,
  ],
  imports: [
    MikroOrmModule.forRoot(),
    ArticleModule,
    UserModule,
    ProfileModule,
    TagModule,
  ],
  providers: [],
})
export class AppModule implements OnModuleInit {

  constructor(private readonly orm: MikroORM) {}

  async onModuleInit(): Promise<void> {
    await this.orm.getMigrator().up();
  }

}
