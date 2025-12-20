import { Entity, PrimaryKey, Property } from '@mikro-orm/mysql';

@Entity()
export class Tag {
  @PrimaryKey()
  id!: number;

  @Property()
  tag!: string;
}
