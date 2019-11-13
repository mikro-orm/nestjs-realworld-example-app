import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiUseTags,
} from '@nestjs/swagger';
import { User } from '../user/user.decorator';
import { IArticleRO, IArticlesRO, ICommentsRO } from './article.interface';
import { ArticleService } from './article.service';
import { CreateArticleDto, CreateCommentDto } from './dto';

@ApiBearerAuth()
@ApiUseTags('articles')
@Controller('articles')
export class ArticleController {

  constructor(private readonly articleService: ArticleService) {}

  @ApiOperation({ title: 'Get all articles' })
  @ApiResponse({ status: 200, description: 'Return all articles.' })
  @Get()
  public async findAll(@Query() query): Promise<IArticlesRO> {
    return this.articleService.findAll(query);
  }

  @Get(':slug')
  public async findOne(@Param('slug') slug): Promise<IArticleRO> {
    return this.articleService.findOne({ slug });
  }

  @Get(':slug/comments')
  public async findComments(@Param('slug') slug): Promise<ICommentsRO> {
    return this.articleService.findComments(slug);
  }

  @ApiOperation({ title: 'Create article' })
  @ApiResponse({ status: 201, description: 'The article has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post()
  public async create(@User('id') userId: number, @Body('article') articleData: CreateArticleDto) {
    return this.articleService.create(userId, articleData);
  }

  @ApiOperation({ title: 'Update article' })
  @ApiResponse({ status: 201, description: 'The article has been successfully updated.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Put(':slug')
  public async update(@Param() params, @Body('article') articleData: CreateArticleDto) {
    // Todo: update slug also when title gets changed
    return this.articleService.update(params.slug, articleData);
  }

  @ApiOperation({ title: 'Delete article' })
  @ApiResponse({ status: 201, description: 'The article has been successfully deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Delete(':slug')
  public async delete(@Param() params) {
    return this.articleService.delete(params.slug);
  }

  @ApiOperation({ title: 'Create comment' })
  @ApiResponse({ status: 201, description: 'The comment has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post(':slug/comments')
  public async createComment(@User('id') user: number, @Param('slug') slug, @Body('comment') commentData: CreateCommentDto) {
    return this.articleService.addComment(user, slug, commentData);
  }

  @ApiOperation({ title: 'Delete comment' })
  @ApiResponse({ status: 201, description: 'The article has been successfully deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Delete(':slug/comments/:id')
  public async deleteComment(@Param() params) {
    const { slug, id } = params;
    return this.articleService.deleteComment(slug, id);
  }

  @ApiOperation({ title: 'Favorite article' })
  @ApiResponse({ status: 201, description: 'The article has been successfully favorited.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post(':slug/favorite')
  public async favorite(@User('id') userId: number, @Param('slug') slug) {
    return this.articleService.favorite(userId, slug);
  }

  @ApiOperation({ title: 'Unfavorite article' })
  @ApiResponse({ status: 201, description: 'The article has been successfully unfavorited.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Delete(':slug/favorite')
  public async unFavorite(@User('id') userId: number, @Param('slug') slug) {
    return this.articleService.unFavorite(userId, slug);
  }

  @ApiOperation({ title: 'Get article feed' })
  @ApiResponse({ status: 200, description: 'Return article feed.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('feed')
  public async getFeed(@User('id') userId: number, @Query() query): Promise<IArticlesRO> {
    return this.articleService.findFeed(userId, query);
  }
}
