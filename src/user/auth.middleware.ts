import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { SECRET } from '../config';
import { User } from './user.entity';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly em: EntityManager) {}

  async use(req: Request & { user?: User }, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new HttpException('Not authorized.', HttpStatus.UNAUTHORIZED);
    }

    const decoded = jwt.verify(token, SECRET) as { id: number };
    req.user = await this.em.findOneOrFail(User, decoded.id, {
      populate: ['followers', 'favorites'],
      failHandler: () => new HttpException('User not found.', HttpStatus.UNAUTHORIZED),
    });
    next();
  }
}
