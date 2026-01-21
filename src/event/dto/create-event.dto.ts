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

class SlotDto {
  @IsString()
  @IsOptional()
  function?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  order: number;
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  month: string; // "01" a "12"

  @IsString()
  @IsNotEmpty()
  day: string; // "01" a "31"

  @IsString()
  @IsNotEmpty()
  time: string; // "HH:mm"

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlotDto)
  @IsOptional()
  slots?: SlotDto[];
}
