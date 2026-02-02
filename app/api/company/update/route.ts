import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const membership = await prisma.companyMember.findFirst({
        where: { userId }
    });

    if (!membership) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const data = await req.json();

    const company = await prisma.company.update({
        where: { id: membership.companyId },
        data: {
            ...(data.name && { name: data.name }),
            ...(data.address && { address: data.address }),
            ...(data.whatsapp && { whatsapp: data.whatsapp }),
            ...(data.email && { email: data.email }),
            ...(data.website && { website: data.website }),
            ...(data.logoUrl && { logoUrl: data.logoUrl }),
            ...(data.pdfTerms && { pdfTerms: data.pdfTerms }),
        }
    });

    return NextResponse.json({ company });
}
