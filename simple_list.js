
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando búsqueda...');
    const users = await prisma.user.findMany();
    console.log('Usuarios encontrados:', JSON.stringify(users, null, 2));
}

main()
    .catch((e) => console.error('Error:', e))
    .finally(() => prisma.$disconnect());
