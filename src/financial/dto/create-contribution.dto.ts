import {
  IsNumber,
  IsPositive,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateContributionDto {
  @IsNumber()
  @IsPositive()
  value: number;

  @IsDateString()
  date: string;

  @IsDateString()
  @IsOptional()
  time?: string;

  @IsString()
  @IsOptional()
  note?: string;
}
