import config from '../mikro-orm.config';
import { Test } from '@nestjs/testing';
import { MikroOrmModule } from 'nestjs-mikro-orm';
import { TagController } from './tag.controller';
import { Tag } from './tag.entity';
import { TagService } from './tag.service';

describe('TagController', () => {
  let tagController: TagController;
  let tagService: TagService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [MikroOrmModule.forRoot(config), MikroOrmModule.forFeature([Tag])],
      controllers: [TagController],
      providers: [TagService],
    }).compile();

    tagService = module.get<TagService>(TagService);
    tagController = module.get<TagController>(TagController);
  });

  describe('findAll', () => {
    it('should return an array of tags', async () => {
      const tags: Tag[] = [];
      const createTag = (id: number, name: string) => {
        const tag = new Tag();
        tag.id = id;
        tag.tag = name;
        return tag;
      };
      tags.push(createTag(1, 'angularjs'));
      tags.push(createTag(2, 'reactjs'));

      jest.spyOn(tagService, 'findAll').mockResolvedValue(tags);

      const findAllResult = await tagController.findAll();
      expect(findAllResult).toBe(tags);
    });
  });
});
