import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin',
    description: 'Nome de usuário único',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha (hash com argon2 no backend)',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
