import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { EntityName } from '@mikro-orm/core';

@Entity()
export class Tag {
  [EntityName]?: 'Tag';

  @PrimaryKey()
  id!: number;

  @Property()
  tag!: string;
}
