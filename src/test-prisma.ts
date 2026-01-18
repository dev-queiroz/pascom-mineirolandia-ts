import prisma from './lib/prisma';

async function main() {
    try {
        console.log("Tentando conectar ao banco...");
        const users = await prisma.user.findMany();
        console.log("Sucesso! Usuários encontrados:", users);
    } catch (error) {
        console.error("Erro ao acessar o banco:", error);
    } finally {
        await prisma.$disconnect();
        console.log("Conexão fechada.");
    }
}

main().catch((e) => {
    console.error("Erro fatal:", e);
    process.exit(1);
});