import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiUseTags,
} from '@nestjs/swagger';
import { ITagsRO } from './tag.interface';
import { TagService } from './tag.service';

@ApiBearerAuth()
@ApiUseTags('tags')
@Controller('tags')
export class TagController {

  constructor(private readonly tagService: TagService) {}

  @Get()
  async findAll(): Promise<ITagsRO> {
    return this.tagService.findAll();
  }
}
