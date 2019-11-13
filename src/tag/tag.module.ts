import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { TagController } from './tag.controller';
import { TagEntity } from './tag.entity';
import { TagService } from './tag.service';

@Module({
  controllers: [
    TagController,
  ],
  exports: [],
  imports: [TypeOrmModule.forFeature([TagEntity]), UserModule],
  providers: [TagService],
})
export class TagModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {}
}
