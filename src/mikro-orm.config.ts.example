import { defineConfig } from '@mikro-orm/mysql';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { entities } from './entities.generated';

export default defineConfig({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: '',
  dbName: 'nestjsrealworld',
  entities,
  debug: true,
  highlighter: new SqlHighlighter(),
  metadataProvider: TsMorphMetadataProvider,
  dynamicImportProvider: id => import(id),
});
