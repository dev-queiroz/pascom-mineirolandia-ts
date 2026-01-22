import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'admin', description: 'Nome de usuário único' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'senha123', description: 'Senha (será hasheada)' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ example: '(85) 99999-9999', description: 'Telefone' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 2, description: 'Limite mensal de escalas' })
  @IsInt()
  @Min(0)
  @IsOptional()
  escalacao?: number;

  @ApiPropertyOptional({ example: 'ativo', description: 'ativo / inativo' })
  @IsString()
  @IsOptional()
  situacao?: string;

  @ApiPropertyOptional({ example: 'Música', description: 'Setor do usuário' })
  @IsString()
  @IsOptional()
  setor?: string;

  @ApiPropertyOptional({ example: 'admin', description: 'user / admin' })
  @IsString()
  @IsOptional()
  funcao?: string;

  @ApiPropertyOptional({
    example: 'sim',
    description: 'sim / nao (para acompanhante)',
  })
  @IsString()
  @IsOptional()
  acompanhante?: string;
}
