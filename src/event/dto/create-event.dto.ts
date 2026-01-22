import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SlotDto {
  @ApiPropertyOptional({ example: 'PC' })
  @IsString()
  @IsOptional()
  function?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(10)
  order: number;
}

export class CreateEventDto {
  @ApiProperty({ example: '01', description: 'Mês (01-12)' })
  @IsString()
  @IsNotEmpty()
  month: string;

  @ApiProperty({ example: '25', description: 'Dia (01-31)' })
  @IsString()
  @IsNotEmpty()
  day: string;

  @ApiProperty({ example: '19:00', description: 'Horário (HH:mm)' })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiPropertyOptional({ example: 'Missa solene' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Matriz de Pedra Branca' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ type: [SlotDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlotDto)
  @IsOptional()
  slots?: SlotDto[];
}
