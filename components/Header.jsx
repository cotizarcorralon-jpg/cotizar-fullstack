import { Settings, LogIn } from 'lucide-react';
import React from 'react';

export default function Header({ onOpenConfig, user, plan, onLoginClick }) {
    return (
        <header style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '70px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--border)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <img src="/logo.png" alt="CotizAPP" className="header-logo" />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {user && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '1rem' }}>
                            <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                                <div className="text-truncate" style={{ fontWeight: '500', color: '#334155' }}>{user.email}</div>
                            </div>
                            <div style={{
                                fontSize: '0.7rem', fontWeight: 'bold',
                                padding: '2px 8px', borderRadius: '12px',
                                textTransform: 'uppercase',
                                backgroundColor: plan === 'Profesional' ? '#fef3c7' : '#f1f5f9',
                                color: plan === 'Profesional' ? '#d97706' : '#64748b',
                                border: plan === 'Profesional' ? '1px solid #fcd34d' : '1px solid #e2e8f0'
                            }}>
                                {plan === 'Profesional' ? 'PRO' : 'Gratis'}
                            </div>
                        </div>
                    )}

                    <button className="btn btn-secondary" onClick={onOpenConfig}>
                        <Settings size={18} />
                        <span className="hidden-mobile">Configuración</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
