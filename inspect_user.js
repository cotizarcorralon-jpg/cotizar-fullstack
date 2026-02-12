
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const email = 'brandon.marketing.contacto@gmail.com';

    console.log(`Inspeccionando usuarios con email: ${email}...`);

    const users = await prisma.user.findMany({
        where: { email },
        include: {
            company: true,
            accounts: true
        },
    });

    console.log(JSON.stringify(users, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
