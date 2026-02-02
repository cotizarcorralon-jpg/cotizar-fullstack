import React from 'react';
import { Lock, Zap } from 'lucide-react';

export default function LimitReachedModal({ isOpen, onClose, onSubscribe }) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1100,
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="card" style={{
                width: '90%', maxWidth: '450px',
                padding: '2.5rem',
                textAlign: 'center',
                position: 'relative',
                borderTop: '4px solid var(--primary)'
            }}>
                <div style={{
                    width: '60px', height: '60px', margin: '0 auto 1.5rem',
                    borderRadius: '50%', background: '#fff7ed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Lock size={32} color="var(--primary)" />
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: '#1e293b' }}>
                    ¡Límite mensual alcanzado!
                </h2>

                <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '2rem' }}>
                    Has utilizado tus <b>3 presupuestos gratuitos</b> de este mes.
                    <br />
                    Para seguir cotizando sin límites y acceder a funciones exclusivas, pasate al Plan Profesional.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                        onClick={onSubscribe}
                        className="btn btn-primary"
                        style={{
                            justifyContent: 'center',
                            padding: '1rem',
                            fontSize: '1rem',
                            background: 'linear-gradient(135deg, var(--primary) 0%, #ea580c 100%)',
                            boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.3)'
                        }}
                    >
                        <Zap size={20} fill="currentColor" />
                        Suscribirse ahora
                    </button>

                    <button
                        onClick={onClose}
                        className="btn btn-ghost"
                        style={{ justifyContent: 'center', color: '#94a3b8' }}
                    >
                        Cerrar y volver
                    </button>
                </div>
            </div>
        </div>
    );
}
