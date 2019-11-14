import { Entity, IdEntity, PrimaryKey, Property } from 'mikro-orm';

@Entity()
export class Tag implements IdEntity<Tag> {

  @PrimaryKey()
  id: number;

  @Property()
  tag: string;

}
