
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            include: { company: true }
        });

        const report = users.map(u => ({
            name: u.name,
            email: u.email,
            plan: u.company?.plan || 'No Company'
        }));

        return NextResponse.json({ count: users.length, users: report });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
