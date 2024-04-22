import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty()
  readonly bio!: string;
  @ApiProperty()
  readonly email!: string;
  @ApiProperty()
  readonly image!: string;
  @ApiProperty()
  readonly username!: string;
}
