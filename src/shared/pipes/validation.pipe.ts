import { ArgumentMetadata, BadRequestException, HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Dictionary } from '@mikro-orm/mysql';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {

  async transform(value: unknown, metadata: ArgumentMetadata) {
    if (!value) {
      throw new BadRequestException('No data submitted');
    }

    const { metatype } = metadata;
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new HttpException({ message: 'Input data validation failed', errors:  this.buildError(errors) }, HttpStatus.BAD_REQUEST);
    }
    return value;
  }

  private buildError(errors: ValidationError[]) {
    const result = {} as Dictionary;

    for (const el of errors) {
      const prop = el.property;
      Object.entries(el.constraints!).forEach((constraint) => {
        result[prop + constraint[0]] = `${constraint[1]}`;
      });
    }

    return result;
  }

  private toValidate(metatype: unknown): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.find((type) => metatype === type);
  }
}
