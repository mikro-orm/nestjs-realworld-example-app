import { Migration } from '@mikro-orm/migrations';

export class Migration20240114224028 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `user` modify `bio` varchar(255) not null;');
    this.addSql('alter table `user` modify `image` varchar(255) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `user` modify `bio` varchar(255) null;');
    this.addSql('alter table `user` modify `image` varchar(255) null;');
  }

}
