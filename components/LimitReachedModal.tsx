'use client';

import { signIn } from 'next-auth/react';
import { X } from 'lucide-react';

type LimitReachedModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function LimitReachedModal({
    isOpen,
    onClose,
}: LimitReachedModalProps) {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: '14px',
                    padding: '2rem',
                    width: '100%',
                    maxWidth: '420px',
                    position: 'relative',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    textAlign: 'center',
                }}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#777',
                    }}
                >
                    <X size={20} />
                </button>

                {/* Mensaje */}
                <h3
                    style={{
                        fontSize: '1.4rem',
                        fontWeight: 700,
                        marginBottom: '0.5rem',
                    }}
                >
                    Alcanzaste el límite gratuito 🚀
                </h3>

                <p
                    style={{
                        color: '#555',
                        fontSize: '0.95rem',
                        marginBottom: '1.5rem',
                        lineHeight: 1.5,
                    }}
                >
                    Ya probaste cómo funciona.
                    <br />
                    Creá tu cuenta gratis y seguí cotizando sin fricciones.
                </p>

                {/* CTA Google */}
                <button
                    onClick={() => signIn('google')}
                    style={{
                        width: '100%',
                        padding: '0.9rem 1.2rem',
                        background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                        border: 'none',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 8px 20px rgba(34,197,94,0.35)',
                    }}
                >
                    Continuar con Google
                </button>

                {/* Microcopy */}
                <p
                    style={{
                        marginTop: '1rem',
                        fontSize: '0.8rem',
                        color: '#777',
                    }}
                >
                    Registrate en un solo click y seguí cotizando de forma ilimitada
                </p>
            </div>
        </div>
    );
}
