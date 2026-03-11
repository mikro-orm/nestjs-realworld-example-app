import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

@Entity()
export class Tag {
  @PrimaryKey()
  id!: number;

  @Property()
  tag!: string;
}
