
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'brandon.marketing.contacto@gmail.com';
    console.log(`Eliminando usuario: ${email}...`);

    // Borrar usuario (la cascada debería borrar Company, Accounts, etc.)
    const deleted = await prisma.user.deleteMany({
        where: { email }
    });

    console.log(`Usuarios eliminados: ${deleted.count}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
