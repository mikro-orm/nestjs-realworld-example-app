import { Options } from '@mikro-orm/core';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { Injectable } from '@nestjs/common';
import { EasyconfigService } from 'nestjs-easyconfig';

@Injectable()
export class ConfigService {
  private easyconfigService: EasyconfigService
  db(): Options{
    return {
      type: 'mysql',
      host: this.easyconfigService.get('host'),
      port: parseInt(this.easyconfigService.get('port')),
      username: this.easyconfigService.get('username'),
      password: this.easyconfigService.get('password'),
      dbName: this.easyconfigService.get('db'),
      entities: ['dist/**/*.entity.js'],
      entitiesTs: ['src/**/*.entity.ts'],
      debug: true,
      highlighter: new SqlHighlighter(),
      metadataProvider: TsMorphMetadataProvider,
    } as Options
  }
}