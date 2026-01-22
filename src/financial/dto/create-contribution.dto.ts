import {
  IsNumber,
  IsPositive,
  IsString,
  IsOptional,
  IsISO8601,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateContributionDto {
  @ApiProperty({ example: 150 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  value: number;

  @ApiProperty({ example: '2026-01-22' })
  @IsISO8601()
  date: string;

  @ApiPropertyOptional({ example: '14:30' })
  @IsString()
  @IsOptional()
  time?: string; // aceita HH:MM ou HH:MM:SS

  @ApiPropertyOptional({ example: 'Doação mensal' })
  @IsString()
  @IsOptional()
  note?: string;
}
