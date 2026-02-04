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
                    borderRadius: '24px',
                    padding: '2rem',
                    width: '100%',
                    maxWidth: '460px',
                    position: 'relative',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            >
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
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '56px', height: '56px', background: '#dbeafe', color: '#2563eb',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem auto'
                    }}>
                        <Rocket size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem', lineHeight: 1.2 }}>
                        ¡Desbloqueá todo el potencial!
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '1rem' }}>
                        Superaste el límite gratuito mensual.
                    </p>
                </div>

                {/* Benefits */}
                <div style={{ textAlign: 'left', background: '#f8fafc', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, marginBottom: '1rem', letterSpacing: '0.05em' }}>
                        VENTAJAS PRO
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {[
                            'Cotizaciones ilimitadas 🚀',
                            'Agregá todos tus productos 📦',
                            'Modificá precios libremente 🏷️',
                            'Personalizá con tu logo y datos 🏢'
                        ].map((item, idx) => (
                            <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', color: '#334155', fontWeight: 500 }}>
                                <div style={{ background: '#dcfce7', borderRadius: '50%', padding: '2px', display: 'flex' }}>
                                    <Check size={14} color="#16a34a" strokeWidth={3} />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Pricing & CTA */}
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                        <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '1.1rem', fontWeight: 500 }}>
                            $89.000
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                                $19.900
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                                /mes para nuevos usuarios
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (onUpgrade) onUpgrade();
                            onClose();
                        }}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'black',
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
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            transition: 'transform 0.1s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <Zap size={20} fill="currentColor" />
                        Obtener Plan PRO
                    </button>

                    <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                        Cancelá cuando quieras. Sin compromisos.
                    </p>
                </div>
            </div>
        </div>
    );
}
