import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChatVisibility } from '@prisma/client';
import {
  IsDefined,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { IsValidUserId } from 'src/user/validators/user-valid-id.decorator';

export class CreateChatDto {
  @IsDefined()
  @IsEnum(ChatVisibility)
  @ApiProperty({ enum: ChatVisibility })
  chatVisibility: ChatVisibility;

  @IsDefined()
  @IsString()
  @ApiProperty({
    type: String,
  })
  name: string;

  @IsOptional()
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  @ApiPropertyOptional({
    type: String,
  })
  password?: string;

  @IsOptional()
  @IsNumber()
  @IsValidUserId()
  @ApiProperty({
    type: Number,
  })
  invitedId?: number;
}
