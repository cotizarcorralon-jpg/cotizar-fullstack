
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // Try to create a quote with the new field to verify DB schema
        const quote = await prisma.quote.create({
            data: {
                companyEmail: 'test@test.com',
                userEmail: 'user@test.com',
                total: 100,
                // We need to provide dummy data for relations if they were required, but they are optional
            }
        });
        console.log('SUCCESS: Crated quote with companyEmail:', quote);

        // Clean up
        await prisma.quote.delete({ where: { id: quote.id } });
    } catch (e) {
        console.error('FAILURE:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
