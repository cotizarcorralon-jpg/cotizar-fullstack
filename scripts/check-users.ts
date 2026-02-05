
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        include: {
            company: true,
        },
    });

    console.log('--- USER LIST & PLANS ---');
    if (users.length === 0) {
        console.log('No users found.');
    }

    users.forEach((user) => {
        const plan = user.company?.plan || 'No Company/Guest';
        console.log(`User: ${user.name || 'Unnamed'} (${user.email}) - Plan: ${plan}`);
    });
    console.log('-------------------------');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
