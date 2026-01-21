import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  escalacao?: number;

  @IsString()
  @IsOptional()
  situacao?: string;

  @IsString()
  @IsOptional()
  setor?: string;

  @IsString()
  @IsOptional()
  funcao?: string;

  @IsString()
  @IsOptional()
  acompanhante?: string;
}
