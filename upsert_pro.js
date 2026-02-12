
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const email = 'brandon.marketing.contacto@gmail.com';
    const name = 'Brandon'; // Nombre por defecto

    console.log(`Procesando usuario: ${email}...`);

    // Intentar buscar el usuario primero
    let user = await prisma.user.findUnique({
        where: { email },
        include: { company: true },
    });

    if (user) {
        console.log('El usuario ya existe.');
        // Si existe, aseguramos que tenga compañía Pro
        if (user.company) {
            if (user.company.plan !== 'Pro') {
                await prisma.company.update({
                    where: { id: user.company.id },
                    data: { plan: 'Pro' },
                });
                console.log('Plan actualizado a Pro.');
            } else {
                console.log('El usuario ya es Pro.');
            }
        } else {
            await prisma.company.create({
                data: {
                    userId: user.id,
                    name: `${name} Company`,
                    plan: 'Pro',
                },
            });
            console.log('Compañía creada y asignada como Pro.');
        }
    } else {
        // Si no existe, lo creamos desde cero
        console.log('El usuario no existe. Creando cuenta nueva...');
        user = await prisma.user.create({
            data: {
                email,
                name,
                company: {
                    create: {
                        name: `${name} Company`,
                        plan: 'Pro',
                    },
                },
            },
            include: { company: true },
        });
        console.log(`Usuario creado exitosamente con ID: ${user.id}`);
        console.log(`Compañía creada: ${user.company.name} (Plan: ${user.company.plan})`);
    }
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
