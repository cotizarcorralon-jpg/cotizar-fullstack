import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { companyId, createdAfter } = body;

        console.log(`[Subscription Check] Iniciando verificación para Company: ${companyId}`);
        if (createdAfter) console.log(`[Subscription Check] Filtrando suscripciones creadas después de: ${new Date(createdAfter).toISOString()}`);

        if (!companyId) {
            return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
        }

        // Consultamos a Mercado Pago si existe alguna suscripción activa
        const searchUrl = new URL('https://api.mercadopago.com/preapproval/search');
        searchUrl.searchParams.append('external_reference', companyId);
        searchUrl.searchParams.append('status', 'authorized'); // Filtro inicial API

        const mpResponse = await fetch(searchUrl.toString(), {
            headers: {
                'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
            },
            cache: 'no-store'
        });

        const data = await mpResponse.json();

        if (mpResponse.ok && data.results) {
            console.log(`[Subscription Check] Resultados encontrados en MP: ${data.results.length}`);

            // Log de estados encontrados para depuración
            data.results.forEach((s: any, i: number) => {
                console.log(`   - Sub ${i}: ID=${s.id}, Status=${s.status}, Date=${s.date_created}`);
            });

            // Buscamos explícitamente una autorizada y opcionalmente reciente
            const activeSub = data.results.find((sub: any) => {
                const isAuthorized = sub.status === 'authorized';
                if (!isAuthorized) return false;

                if (createdAfter) {
                    const subDate = new Date(sub.date_created).getTime();
                    // Date.now() uses local time, but createdAfter from client is likely UTC/ISO or timestamp (ms).
                    // Sub date from MP is ISO string. new Date(iso) works.
                    // Allow 5 min buffer for clock skew
                    const threshold = new Date(createdAfter).getTime() - (5 * 60 * 1000);
                    const isNewEnough = subDate >= threshold;

                    if (!isNewEnough) {
                        console.log(`   -> Ignorando suscripción autorizada ${sub.id} por ser antigua (${sub.date_created}) vs threshold (${new Date(threshold).toISOString()})`);
                    }
                    return isNewEnough;
                }

                return true;
            });

            if (activeSub) {
                console.log(`[Subscription Check] ¡Suscripción ACTIVA detectada! ID: ${activeSub.id}, Creada: ${activeSub.date_created}`);

                // Actualizamos DB
                const updatedCompany = await prisma.company.update({
                    where: { id: companyId },
                    data: { plan: 'Profesional' }
                });

                return NextResponse.json({
                    active: true,
                    company: updatedCompany,
                    subscription: activeSub
                });
            } else {
                console.log(`[Subscription Check] No se encontró ninguna suscripción con status === 'authorized' en los resultados.`);
            }
        } else {
            console.log(`[Subscription Check] Respuesta MP vacía o error. Status: ${mpResponse.status}`);
        }

        return NextResponse.json({ active: false });

    } catch (error) {
        console.error("[Subscription Check] Error CRÍTICO:", error);
        return NextResponse.json({ error: 'Check Failed' }, { status: 500 });
    }
}
