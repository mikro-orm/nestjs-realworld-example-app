import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Tag {

  @PrimaryKey()
  id: number;

  @Property()
  tag: string;

}
