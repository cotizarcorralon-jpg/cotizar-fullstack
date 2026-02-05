'use client';

import { X, Check, Zap, Rocket } from 'lucide-react';

type LimitReachedModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade?: () => void;
};

export default function LimitReachedModal({
    isOpen,
    onClose,
    onUpgrade
}: LimitReachedModalProps) {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '1.25rem',
                    width: '95%',
                    maxWidth: '400px',
                    maxHeight: '95vh', // Increased max-height slightly just in case
                    overflowY: 'auto',
                    position: 'relative',
                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.2)',
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.1)',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
            >
                <style jsx>{`
                    div::-webkit-scrollbar {
                        display: none; /* Hide scrollbar for Chrome/Safari/Opera */
                    }
                `}</style>
                {/* Close */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: '#f8fafc',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748b',
                        padding: '8px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{
                        width: '40px', height: '40px', background: '#dbeafe', color: '#2563eb',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 0.5rem auto'
                    }}>
                        <Rocket size={20} />
                    </div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.2rem', lineHeight: 1.2 }}>
                        No frenes tus ventas por un límite
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        Pasá a PRO y cotizá sin restricciones
                    </p>
                </div>

                {/* Benefits */}
                <div style={{ textAlign: 'left', background: '#f8fafc', borderRadius: '12px', padding: '0.9rem', marginBottom: '0.75rem', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.05em', textAlign: 'center' }}>
                        VENTAJAS PRO
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {[
                            'Cotizá sin límites y respondé más rápido',
                            'Tené todo tu catálogo en un solo lugar',
                            'Ajustá precios en segundos y evitá errores',
                            'Enviá cotizaciones con tu marca profesional'
                        ].map((item, idx) => (
                            <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155', fontWeight: 500, textAlign: 'left' }}>
                                <div style={{ background: '#dcfce7', borderRadius: '50%', padding: '2px', display: 'flex', flexShrink: 0 }}>
                                    <Check size={12} color="#16a34a" strokeWidth={3} />
                                </div>
                                <span style={{ flex: 1, lineHeight: '1.25' }}>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Pricing & CTA */}
                <div style={{ marginBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
                        {/* Old Price Centered Above */}
                        <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500, marginBottom: '-4px' }}>
                            $89.000
                        </span>

                        {/* Main Price Perfectly Centered */}
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', justifyContent: 'center' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, letterSpacing: '-0.02em' }}>
                                $19.900 ARS
                            </span>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                                /mes
                            </span>
                        </div>

                        <p style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginTop: '8px', background: '#dcfce7', padding: '4px 12px', borderRadius: '100px' }}>
                            💡 Menos de $700 pesos por día
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            if (onUpgrade) onUpgrade();
                            onClose();
                        }}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: '#16a34a',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.2), 0 2px 4px -1px rgba(22, 163, 74, 0.1)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.background = '#15803d';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.background = '#16a34a';
                        }}
                    >
                        🚀 Activar PRO ahora
                    </button>

                    <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                        🔒 Sin contratos. Cancelá cuando quieras.
                    </p>
                </div>
            </div>
        </div>
    );
}
