import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { companyId } = body;

        console.log("Verificando suscripción para Company:", companyId);

        if (!companyId) {
            return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
        }

        // Consultamos a Mercado Pago si existe alguna suscripción activa para este companyId (external_reference)
        // Usamos /preapproval/search
        const searchUrl = new URL('https://api.mercadopago.com/preapproval/search');
        searchUrl.searchParams.append('external_reference', companyId);
        searchUrl.searchParams.append('status', 'authorized'); // Solo las activas

        const mpResponse = await fetch(searchUrl.toString(), {
            headers: {
                'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
            }
        });

        const data = await mpResponse.json();

        if (mpResponse.ok && data.results && data.results.length > 0) {
            // Filter strictly for authorized status in case the search param was loose
            const activeSub = data.results.find((sub: any) => sub.status === 'authorized');

            if (activeSub) {
                // Encontramos una suscripción activa y autorizada
                console.log("Suscripción activa encontrada en MP para:", companyId);

                // Actualizamos la DB por si el webhook falló
                const updatedCompany = await prisma.company.update({
                    where: { id: companyId },
                    data: { plan: 'Profesional' }
                });

                return NextResponse.json({
                    active: true,
                    company: updatedCompany,
                    subscription: activeSub
                });
            }
        }

        return NextResponse.json({ active: false });

    } catch (error) {
        console.error("Check Subscription Error:", error);
        return NextResponse.json({ error: 'Check Failed' }, { status: 500 });
    }
}
