import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function Hero({ onScrollToQuote }) {
    return (
        <section style={{
            padding: '140px 0 80px 0',
            textAlign: 'center',
            background: 'linear-gradient(to bottom, #f8fafc, #fff)'
        }}>
            <div className="container">
                <h1 style={{
                    fontSize: '3.5rem',
                    fontWeight: '800',
                    lineHeight: '1.1',
                    marginBottom: '1.5rem',
                    letterSpacing: '-0.03em',
                    color: 'var(--text-primary)'
                }}>
                    Cotizá en minutos <br />
                    <span style={{ color: 'var(--primary)' }}>lo que hoy te lleva una hora</span>
                </h1>

                <p style={{
                    fontSize: '1.25rem',
                    color: 'var(--text-secondary)',
                    maxWidth: '600px',
                    margin: '0 auto 2.5rem auto',
                    lineHeight: '1.6'
                }}>
                    Simplemente pegá el mensaje de WhatsApp y cotizAR interpreta el pedido, calcula los precios y genera un PDF listo para enviar.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }} onClick={onScrollToQuote}>
                        Probar gratis ahora
                        <ChevronDown size={20} />
                    </button>
                </div>
            </div>
        </section>
    );
}
