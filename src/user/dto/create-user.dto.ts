import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {

  @IsNotEmpty()
  @ApiProperty()
  readonly username!: string;

  @IsNotEmpty()
  @ApiProperty()
  readonly email!: string;

  @IsNotEmpty()
  @ApiProperty()
  readonly password!: string;
}
