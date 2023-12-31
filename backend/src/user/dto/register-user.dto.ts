import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @ApiProperty({
    description: 'Username to register, can be different than the intraname.',
  })
  @Transform((name: TransformFnParams) =>
    (name.value as string).toLowerCase().trim()
  )
  username: string;

  @IsOptional()
  @ApiPropertyOptional({
    description: 'Possible image to upload as profile avatar.',
  })
  image?: any;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    type: String,
    description: 'Two factor authentication code.',
  })
  code2fa: string;
}
