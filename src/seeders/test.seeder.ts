import { EntityManager } from '@mikro-orm/mysql';
import { Seeder } from '@mikro-orm/seeder';
import { User } from '../user/user.entity';

export class TestSeeder extends Seeder {

  async run(em: EntityManager): Promise<void> {
    const author = em.create(User, {
      username: 'John Snow',
      email: 'snow@wall.st',
      password: 'snow@wall.st',
    });
  }

}
