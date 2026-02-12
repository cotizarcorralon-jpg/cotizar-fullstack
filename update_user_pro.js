
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Cargar variables de entorno manualmente
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2 && !line.startsWith('#')) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/^"(.*)"$/, '$1');
            process.env[key] = value;
        }
    });
}

const prisma = new PrismaClient();

async function main() {
    const email = 'brandon.marketing.contacto@gmail.com';

    console.log(`Buscando usuario con email: ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email },
        include: { company: true },
    });

    if (!user) {
        console.error(`Error: No se encontró ningún usuario con el email ${email}`);
        process.exit(1);
    }

    console.log(`Usuario encontrado: ${user.name || 'Sin nombre'} (${user.id})`);

    if (user.company) {
        console.log(`El usuario ya tiene una compañía asociada. Actualizando plan a 'Pro'...`);
        const updatedCompany = await prisma.company.update({
            where: { id: user.company.id },
            data: { plan: 'Pro' },
        });
        console.log(`Compañía actualizada exitosamente. Plan actual: ${updatedCompany.plan}`);
    } else {
        console.log(`El usuario no tiene compañía. Creando nueva compañía con plan 'Pro'...`);
        const newCompany = await prisma.company.create({
            data: {
                userId: user.id,
                name: user.name || 'Mi Empresa',
                plan: 'Pro',
            },
        });
        console.log(`Compañía creada exitosamente. Plan actual: ${newCompany.plan}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
