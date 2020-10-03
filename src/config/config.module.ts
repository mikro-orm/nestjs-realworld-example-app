import { DynamicModule, Global, Module } from '@nestjs/common';
import { EasyconfigModule } from 'nestjs-easyconfig';
import { ConfigService } from './config.service';

@Global()
@Module({
  imports: [EasyconfigModule.register({ path: './env/prod.env' })],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule { }

