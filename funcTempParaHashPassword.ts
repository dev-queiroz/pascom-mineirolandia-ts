//função temporária paara gerar hash de senha
import * as argon2 from 'argon2';

async function hashPassword(password: string): Promise<string> {
  const hash = await argon2.hash(password);
  return hash;
}

// Exemplo de uso
hashPassword('senha123').then(hash => {
  console.log('Hash da senha:', hash);
});