import {
  IsNumber,
  IsPositive,
  IsString,
  IsOptional,
  IsISO8601,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
  @ApiProperty({ example: 80.5 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  value: number;

  @ApiProperty({ example: '2026-02-05' })
  @IsISO8601()
  date: string;

  @ApiPropertyOptional({ example: 'Pagamento de energia' })
  @IsString()
  @IsOptional()
  note?: string;
}
