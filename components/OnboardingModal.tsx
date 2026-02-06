
import React from 'react';
import { X, Building2, ArrowRight } from 'lucide-react';

export default function OnboardingModal({ isOpen, onClose, onConfigure, onSkip }: {
    isOpen: boolean;
    onClose: () => void;
    onConfigure: () => void;
    onSkip: () => void;
}) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div className="card" style={{
                maxWidth: '500px', width: '90%', padding: '0',
                overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                {/* Header Visual */}
                <div style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
                    padding: '2rem', textAlign: 'center', position: 'relative'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: '15px', right: '15px',
                            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
                            width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'white'
                        }}
                    >
                        <X size={18} />
                    </button>

                    <div style={{
                        background: 'white', width: '64px', height: '64px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        <Building2 size={32} color="var(--primary)" />
                    </div>

                    <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                        Antes de empezar...
                    </h2>
                </div>

                {/* Content */}
                <div style={{ padding: '2rem' }}>
                    <p style={{
                        fontSize: '1.1rem', color: '#334155', lineHeight: '1.6', textAlign: 'center', marginBottom: '2rem'
                    }}>
                        Para vivir la experiencia completa, te recomendamos agregar el <strong>nombre y logo</strong> de tu empresa.
                        <br /><br />
                        <span style={{ fontSize: '0.95rem', color: '#64748b' }}>
                            Así podrás ver cómo quedan los presupuestos reales listos para enviar a tus clientes.
                        </span>
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button
                            onClick={onConfigure}
                            className="btn btn-primary"
                            style={{ justifyContent: 'center', padding: '1rem', fontSize: '1.1rem' }}
                        >
                            ⚙️ Configurar mi Empresa (Recomendado)
                        </button>

                        <button
                            onClick={onSkip}
                            style={{
                                background: 'transparent', border: 'none', color: '#94a3b8',
                                padding: '0.5rem', cursor: 'pointer', fontSize: '0.9rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}
                        >
                            Saltar y probar así no más <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
