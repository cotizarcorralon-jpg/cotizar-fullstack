import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(req: Request) {
    try {
        // Basic check for userId in query param if we don't have session helper handy immediately
        // Or better, use the userId passed from frontend for now to keep it simple and robust
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const defaultMaterials = [
            { name: 'Cemento (bolsa 25 kg)', unit: 'bolsa', price: 8500, keywords: ['cemento', 'bolsa de cemento', 'cemento 25'] },
            { name: 'Cal (bolsa)', unit: 'bolsa', price: 4500, keywords: ['cal', 'cal comun', 'bolsa de cal'] },
            { name: 'Arena', unit: 'm3', price: 15000, keywords: ['arena', 'arena fina', 'metros de arena', 'metro de arena', 'mts arena'] },
            { name: 'Piedra partida', unit: 'm3', price: 28000, keywords: ['piedra', 'piedra partida', 'metros de piedra'] },
            { name: 'Ladrillo Hueco 8x18x33', unit: 'u', price: 300, keywords: ['ladrillo 8', 'hueco 8', 'ladrillo del 8', 'ladrillo hueco 8', 'ladrillos 8'] },
            { name: 'Ladrillo Hueco 12x18x33', unit: 'u', price: 350, keywords: ['ladrillo 12', 'hueco 12', 'ladrillo del 12', 'ladrillos', 'huecos', 'ladrillo hueco', 'ladrillos huecos'] },
            { name: 'Hierro / Acero (kg)', unit: 'kg', price: 1200, keywords: ['hierro', 'acero', 'barra del', 'hierro del'] }
        ];

        let company = await prisma.company.findUnique({
            where: { userId: userId },
        });

        if (!company) {
            // Create default company for this user with default materials
            company = await prisma.company.create({
                data: {
                    userId: userId,
                    name: 'Mi Empresa',
                    address: 'Dirección a configurar',
                    email: '',
                    plan: 'Guest',
                    materials: {
                        create: defaultMaterials
                    }
                }
            });
        } else {
            // Check if company has materials. If not (migration/legacy case), add defaults.
            const materialCount = await prisma.material.count({
                where: { companyId: company!.id }
            });

            if (materialCount === 0) {
                await prisma.material.createMany({
                    data: defaultMaterials.map(m => ({
                        ...m,
                        companyId: company!.id
                    }))
                });
            }
        }

        return NextResponse.json(company);
    } catch (error) {
        console.error("Error fetching/creating company:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
