
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log('Usuarios encontrados:', users);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
