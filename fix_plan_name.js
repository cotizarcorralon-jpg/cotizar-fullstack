
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'brandon.marketing.contacto@gmail.com';
    console.log(`Corrigiendo plan para: ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email },
        include: { company: true },
    });

    if (user && user.company) {
        if (user.company.plan === 'Pro') {
            console.log(`Plan actual es 'Pro', cambiando a 'Profesional' para coincidir con frontend...`);
            await prisma.company.update({
                where: { id: user.company.id },
                data: { plan: 'Profesional' }
            });
            console.log('¡Corrección exitosa!');
        } else {
            console.log(`El plan actual es '${user.company.plan}'. Forzando a 'Profesional'...`);
            await prisma.company.update({
                where: { id: user.company.id },
                data: { plan: 'Profesional' }
            });
            console.log('¡Actualizado a Profesional!');
        }
    } else {
        console.error('No se encontró compañía para este usuario.');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
