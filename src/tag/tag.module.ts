import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { TagController } from './tag.controller';
import { Tag } from './tag.entity';
import { TagService } from './tag.service';
import { MikroOrmModule } from 'nestjs-mikro-orm';

@Module({
  controllers: [
    TagController,
  ],
  exports: [],
  imports: [MikroOrmModule.forFeature({ entities: [Tag] }), UserModule],
  providers: [TagService],
})
export class TagModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
