import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { type Loaded } from '@mikro-orm/mysql';
import { User } from '../user/user.decorator';
import { User as UserEntity } from '../user/user.entity';
import { IArticleRO, IArticlesRO, ICommentsRO } from './article.interface';
import { ArticleService } from './article.service';
import { CreateArticleDto, CreateCommentDto } from './dto';

type AuthedUser = Loaded<UserEntity, 'followers' | 'favorites'>;

@ApiBearerAuth()
@ApiTags('articles')
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @ApiOperation({ summary: 'Get all articles' })
  @ApiResponse({ status: 200, description: 'Return all articles.' })
  @Get()
  async findAll(@User('id') userId: number, @Query() query: any): Promise<IArticlesRO> {
    return this.articleService.findAll(+userId, query);
  }

  @ApiOperation({ summary: 'Get article feed' })
  @ApiResponse({ status: 200, description: 'Return article feed.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('feed')
  async getFeed(@User() user: AuthedUser, @Query() query: any): Promise<IArticlesRO> {
    return this.articleService.findFeed(user, query);
  }

  @Get(':slug')
  async findOne(@User('id') userId: number, @Param('slug') slug: string): Promise<IArticleRO> {
    return this.articleService.findOne(userId, { slug });
  }

  @Get(':slug/comments')
  async findComments(@Param('slug') slug: string): Promise<ICommentsRO> {
    return this.articleService.findComments(slug);
  }

  @ApiOperation({ summary: 'Create article' })
  @ApiResponse({ status: 201, description: 'The article has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post()
  async create(@User() user: AuthedUser, @Body('article') articleData: CreateArticleDto) {
    return this.articleService.create(user, articleData);
  }

  @ApiOperation({ summary: 'Update article' })
  @ApiResponse({ status: 201, description: 'The article has been successfully updated.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Put(':slug')
  async update(
    @User() user: AuthedUser,
    @Param() params: { slug: string },
    @Body('article') articleData: CreateArticleDto,
  ) {
    // Todo: update slug also when title gets changed
    return this.articleService.update(user, params.slug, articleData);
  }

  @ApiOperation({ summary: 'Delete article' })
  @ApiResponse({ status: 201, description: 'The article has been successfully deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Delete(':slug')
  async delete(@Param() params: { slug: string }) {
    return this.articleService.delete(params.slug);
  }

  @ApiOperation({ summary: 'Create comment' })
  @ApiResponse({ status: 201, description: 'The comment has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post(':slug/comments')
  async createComment(
    @User() user: AuthedUser,
    @Param('slug') slug: string,
    @Body('comment') commentData: CreateCommentDto,
  ) {
    return this.articleService.addComment(user, slug, commentData);
  }

  @ApiOperation({ summary: 'Delete comment' })
  @ApiResponse({ status: 201, description: 'The article has been successfully deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Delete(':slug/comments/:id')
  async deleteComment(@User() user: AuthedUser, @Param() params: { slug: string; id: string }) {
    return this.articleService.deleteComment(user, params.slug, +params.id);
  }

  @ApiOperation({ summary: 'Favorite article' })
  @ApiResponse({ status: 201, description: 'The article has been successfully favorited.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post(':slug/favorite')
  async favorite(@User() user: AuthedUser, @Param('slug') slug: string) {
    return this.articleService.favorite(user, slug);
  }

  @ApiOperation({ summary: 'Unfavorite article' })
  @ApiResponse({ status: 201, description: 'The article has been successfully unfavorited.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Delete(':slug/favorite')
  async unFavorite(@User() user: AuthedUser, @Param('slug') slug: string) {
    return this.articleService.unFavorite(user, slug);
  }
}
