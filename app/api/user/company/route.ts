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

        let company = await prisma.company.findUnique({
            where: { userId: userId },
        });

        if (!company) {
            // Create default company for this user
            company = await prisma.company.create({
                data: {
                    userId: userId,
                    name: 'Mi Empresa',
                    address: 'Dirección a configurar',
                    email: '',
                    plan: 'Guest',
                }
            });
        }

        return NextResponse.json(company);
    } catch (error) {
        console.error("Error fetching/creating company:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
