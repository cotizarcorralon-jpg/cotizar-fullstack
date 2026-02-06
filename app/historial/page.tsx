
import { prisma } from '@/lib/prisma';
import React from 'react';

// Force dynamic rendering to always get the latest data
export const dynamic = 'force-dynamic';

export default async function HistorialPage() {
    const quotes = await prisma.quote.findMany({
        orderBy: {
            createdAt: 'desc',
        },
        take: 100 // Show last 100
    });

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-[#2A2A2A] mb-8">Historial de Cotizaciones (Analytics)</h1>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-700 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Usuario (Cuenta)</th>
                                    <th className="px-6 py-4">Empresa (Contacto)</th>
                                    <th className="px-6 py-4">Mensaje Original</th>
                                    <th className="px-6 py-4 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {quotes.map((quote) => (
                                    <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                            {new Date(quote.createdAt).toLocaleString('es-AR')}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 font-medium">
                                            {quote.userEmail || <span className="text-gray-400 italic">Invitado</span>}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {quote.companyEmail || '-'}
                                        </td>
                                        <td className="px-6 py-4 w-1/3">
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-gray-700 font-mono text-xs max-h-32 overflow-y-auto">
                                                {quote.rawMessage}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-[#FF6B00]">
                                            ${quote.total?.toLocaleString('es-AR')}
                                        </td>
                                    </tr>
                                ))}

                                {quotes.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                            No hay cotizaciones registradas aún.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
