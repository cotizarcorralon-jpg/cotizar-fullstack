
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'brandon.marketing.contacto@gmail.com';
    console.log(`Buscando y actualizando usuario: ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email },
        include: { company: true },
    });

    if (!user) {
        console.error(`Error: No se encontró al usuario. Asegúrate de haber iniciado sesión.`);
        return;
    }

    // Actualizar la compañía a PRO
    if (user.company) {
        await prisma.company.update({
            where: { id: user.company.id },
            data: { plan: 'Pro' }
        });
        console.log(`¡Éxito! La compañía '${user.company.name}' ahora es PRO.`);
    } else {
        // Si por alguna razón no tiene compañía (raro), la creamos
        await prisma.company.create({
            data: {
                userId: user.id,
                name: user.name || 'Mi Empresa',
                plan: 'Pro',
                email: user.email // Buen default
            }
        });
        console.log(`¡Éxito! Se creó una nueva compañía PRO para el usuario.`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
