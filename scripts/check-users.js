
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
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
            const plan = user.company ? user.company.plan : 'No Company/Guest';
            console.log(`User: ${user.name || 'Unnamed'} (${user.email || 'No Email'}) - Plan: ${plan}`);
        });
        console.log('-------------------------');
    } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
