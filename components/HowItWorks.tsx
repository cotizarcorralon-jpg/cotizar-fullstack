'use client';

import { MessageSquare, Calculator, FileText } from 'lucide-react';

export default function HowItWorks() {
    const steps = [
        {
            icon: <MessageSquare size={32} color="var(--primary)" />,
            title: "1. Pegá el pedido",
            desc: "Copiá el mensaje de WhatsApp tal cual te lo envió el cliente."
        },
        {
            icon: <Calculator size={32} color="var(--primary)" />,
            title: "2. Cotizá",
            desc: "Nuestra IA simple detecta materiales y calcula los precios automáticamente."
        },
        {
            icon: <FileText size={32} color="var(--primary)" />,
            title: "3. Descargá",
            desc: "Bajá el PDF con tu logo y datos, listo para compartir."
        }
    ];

    return (
        <section style={{ padding: '40px 0 80px 0' }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem'
                }}>
                    {steps.map((step, i) => (
                        <div key={i} className="card" style={{
                            textAlign: 'center',
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem',
                            border: 'none',
                            boxShadow: 'none',
                            background: 'transparent'
                        }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: '#d1fae5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '0.5rem'
                            }}>
                                {step.icon}
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{step.title}</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
