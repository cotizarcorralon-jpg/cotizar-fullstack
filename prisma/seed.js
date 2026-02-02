const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_MATERIALS = [
    { name: 'Cemento (bolsa 25 kg)', unit: 'bolsa', price: 8500, synonyms: ['cemento', 'bolsa de cemento', 'cemento 25'] },
    { name: 'Cal (bolsa)', unit: 'bolsa', price: 4500, synonyms: ['cal', 'cal comun', 'bolsa de cal'] },
    { name: 'Arena', unit: 'm3', price: 15000, synonyms: ['arena', 'arena fina', 'metros de arena', 'metro de arena', 'mts arena'] },
    { name: 'Piedra partida', unit: 'm3', price: 28000, synonyms: ['piedra', 'piedra partida', 'metros de piedra'] },
    { name: 'Ladrillo Hueco 8x18x33', unit: 'u', price: 300, synonyms: ['ladrillo 8', 'hueco 8', 'ladrillo del 8', 'ladrillo hueco 8', 'ladrillos 8'] },
    { name: 'Ladrillo Hueco 12x18x33', unit: 'u', price: 350, synonyms: ['ladrillo 12', 'hueco 12', 'ladrillo del 12', 'ladrillos', 'huecos', 'ladrillo hueco', 'ladrillos huecos'] },
    { name: 'Hierro / Acero (kg)', unit: 'kg', price: 1200, synonyms: ['hierro', 'acero', 'barra del', 'hierro del'] }
];

async function main() {
    console.log('🌱 Seeding database...');

    // Create demo company
    const company = await prisma.company.create({
        data: {
            name: 'Corralón Demo',
            address: 'Av. Ejemplo 123, Buenos Aires',
            whatsapp: '5491112345678',
            email: 'contacto@corralonDemo.com',
            pdfTerms: 'Presupuesto válido por 7 días. IVA incluido. Flete NO incluido.'
        }
    });

    console.log('✅ Demo company created:', company.id);

    // Create materials for demo company
    for (const mat of DEFAULT_MATERIALS) {
        await prisma.material.create({
            data: {
                companyId: company.id,
                ...mat
            }
        });
    }

    console.log('✅ Default materials created');

    // Create FREE subscription for demo company
    await prisma.subscription.create({
        data: {
            companyId: company.id,
            plan: 'FREE',
            status: 'active'
        }
    });

    console.log('✅ FREE subscription created');
    console.log('🎉 Seed completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
