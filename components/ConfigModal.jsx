'use client';

import React, { useState } from 'react';
import { X, Plus, Search, Check } from 'lucide-react';

export default function ConfigModal({
    isOpen, onClose,
    company, setCompany,
    materials, // Read only list
    onAddMaterial, onUpdateMaterial, // Actions
    plan, onUpgrade, // Actions
    initialTab
}) {
    const [activeTab, setActiveTab] = useState('company');
    const [searchTerm, setSearchTerm] = useState('');
    const [newMaterial, setNewMaterial] = useState({ name: '', unit: '', price: '' });
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'success'

    // Helper to normalize DB keys (website, logoUrl, pdfTerms) to Frontend keys (web, logo, terms)
    const normalizeCompany = (c) => {
        if (!c) return {};
        return {
            ...c,
            web: c.web || c.website || '',
            logo: c.logo || c.logoUrl || '',
            terms: c.terms || c.pdfTerms || ''
        };
    };

    // Local state for company form to avoid auto-saving on every keystroke
    const [localCompany, setLocalCompany] = useState(normalizeCompany(company));

    // Sync tab when opening & sync local company data
    React.useEffect(() => {
        if (isOpen) {
            if (initialTab) setActiveTab(initialTab);
            setLocalCompany(normalizeCompany(company));
            setSaveStatus('idle');
        }
    }, [isOpen, initialTab, company]);

    const [showSupportModal, setShowSupportModal] = useState(false);

    if (!isOpen) return null;

    // -- Handlers --
    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setLocalCompany({ ...localCompany, logo: ev.target.result });
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateMat = (id, field, value) => {
        // Find current material to get full object for update
        const current = materials.find(m => m.id === id);
        if (current) {
            onUpdateMaterial(id, { ...current, [field]: value });
        }
    };

    const handleAddMat = () => {
        if (!newMaterial.name) return;
        onAddMaterial({
            name: newMaterial.name,
            unit: newMaterial.unit || 'u',
            price: parseFloat(newMaterial.price) || 0,
            keywords: [newMaterial.name.toLowerCase()]
        });
        setNewMaterial({ name: '', unit: '', price: '' });
    };

    const filteredMaterials = (materials || []).filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <div className="card config-card" style={{
                    display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden'
                }}>

                    {/* Header */}
                    <div style={{
                        padding: '1.5rem', borderBottom: '1px solid var(--border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Configuración</h2>
                        <button onClick={onClose}><X size={24} /></button>
                    </div>

                    {/* Content Container */}
                    <div className="config-content" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                        {/* Sidebar */}
                        <aside className="config-sidebar" style={{ background: '#f8fafc', padding: '1rem' }}>
                            {/* Mobile Dropdown */}
                            <div className="mobile-only-nav">
                                <select
                                    value={activeTab}
                                    onChange={(e) => setActiveTab(e.target.value)}
                                    className="input"
                                    style={{ marginBottom: '1rem' }}
                                >
                                    <option value="company">Empresa</option>
                                    <option value="materials">Materiales y Precios</option>
                                    <option value="plan">Mi Plan</option>
                                </select>
                            </div>

                            {/* Desktop Nav */}
                            <nav className="desktop-only-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setActiveTab('company')}
                                    className={`btn ${activeTab === 'company' ? 'btn-primary' : 'btn-ghost'}`}
                                    style={{ justifyContent: 'flex-start', width: '100%' }}>
                                    Empresa
                                </button>
                                <button
                                    onClick={() => setActiveTab('materials')}
                                    className={`btn ${activeTab === 'materials' ? 'btn-primary' : 'btn-ghost'}`}
                                    style={{ justifyContent: 'flex-start', width: '100%' }}>
                                    Materiales y Precios
                                </button>
                                <button
                                    onClick={() => setActiveTab('plan')}
                                    className={`btn ${activeTab === 'plan' ? 'btn-primary' : 'btn-ghost'}`}
                                    style={{ justifyContent: 'flex-start', width: '100%' }}>
                                    Mi Plan
                                </button>
                            </nav>
                        </aside>

                        {/* Main Content */}
                        <main className="config-main" style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>

                            {activeTab === 'company' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
                                    {/* Inputs modify local state */}
                                    <label>
                                        <span style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Nombre Comercial</span>
                                        <input
                                            className="input"
                                            value={localCompany.name || ''}
                                            onChange={e => setLocalCompany({ ...localCompany, name: e.target.value })}
                                        />
                                    </label>
                                    <label>
                                        <span style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Dirección</span>
                                        <input
                                            className="input"
                                            value={localCompany.address || ''}
                                            onChange={e => setLocalCompany({ ...localCompany, address: e.target.value })}
                                        />
                                    </label>
                                    <label>
                                        <span style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>WhatsApp</span>
                                        <input
                                            className="input"
                                            value={localCompany.whatsapp || ''}
                                            onChange={e => setLocalCompany({ ...localCompany, whatsapp: e.target.value })}
                                        />
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <label>
                                            <span style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Email</span>
                                            <input
                                                className="input"
                                                value={localCompany.email || ''}
                                                onChange={e => setLocalCompany({ ...localCompany, email: e.target.value })}
                                            />
                                        </label>
                                        <label>
                                            <span style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Web</span>
                                            <input
                                                className="input"
                                                value={localCompany.web || ''}
                                                onChange={e => setLocalCompany({ ...localCompany, web: e.target.value })}
                                            />
                                        </label>
                                    </div>

                                    <label>
                                        <span style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Logo</span>
                                        <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ marginTop: '0.5rem' }} />
                                        {localCompany.logo && <img src={localCompany.logo} alt="Logo Preview" style={{ height: '50px', marginTop: '1rem', display: 'block' }} />}
                                    </label>

                                    <label>
                                        <span style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Términos y condiciones (para el PDF)</span>
                                        <textarea
                                            className="input"
                                            rows={3}
                                            value={localCompany.terms || ''}
                                            onChange={e => setLocalCompany({ ...localCompany, terms: e.target.value })}
                                        />
                                    </label>

                                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
                                        {saveStatus === 'success' && (
                                            <div style={{
                                                position: 'absolute', top: '-40px', right: '0',
                                                backgroundColor: '#dcfce7', color: '#166534',
                                                padding: '0.5rem 1rem', borderRadius: '20px',
                                                fontSize: '0.9rem', fontWeight: 'bold',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                                animation: 'fadeInOut 2s forwards',
                                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                zIndex: 10
                                            }}>
                                                <Check size={16} /> Guardado correctamente
                                            </div>
                                        )}
                                        <button
                                            className="btn btn-primary"
                                            disabled={saveStatus === 'saving'}
                                            onClick={async () => {
                                                setSaveStatus('saving');
                                                try {
                                                    // We await the parent update which calls the API
                                                    await setCompany(localCompany);
                                                    setSaveStatus('success');
                                                    setTimeout(() => setSaveStatus('idle'), 3000);
                                                } catch (e) {
                                                    console.error(e);
                                                    setSaveStatus('idle');
                                                    alert("Error al guardar");
                                                }
                                            }}
                                            style={{ width: '100%', justifyContent: 'center' }}
                                        >
                                            {saveStatus === 'saving' ? 'Guardando...' : '💾 Guardar Cambios'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'materials' && (
                                <div>
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div style={{ position: 'relative', flex: 1 }}>
                                            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'gray' }} />
                                            <input
                                                className="input"
                                                style={{ paddingLeft: '35px' }}
                                                placeholder="Buscar material..."
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Add New */}
                                    <div className="new-material-grid" style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', gap: '0.5rem', alignItems: 'end' }}>
                                        <label>
                                            <span style={{ fontSize: '0.8rem' }}>Nombre</span>
                                            <input className="input" placeholder="Ej: Ladrillo hueco" value={newMaterial.name} onChange={e => setNewMaterial({ ...newMaterial, name: e.target.value })} />
                                        </label>
                                        <label>
                                            <span style={{ fontSize: '0.8rem' }}>Unidad</span>
                                            <input className="input" placeholder="Ej: m3" value={newMaterial.unit} onChange={e => setNewMaterial({ ...newMaterial, unit: e.target.value })} />
                                        </label>
                                        <label>
                                            <span style={{ fontSize: '0.8rem' }}>Precio</span>
                                            <input className="input" type="number" placeholder="0" value={newMaterial.price} onChange={e => setNewMaterial({ ...newMaterial, price: e.target.value })} />
                                        </label>
                                        <button className="btn btn-primary" onClick={handleAddMat}><Plus size={18} /></button>
                                    </div>

                                    {/* List */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {filteredMaterials.map(mat => (
                                            <div key={mat.id} className="material-item-grid" style={{ gap: '1rem', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px', alignItems: 'center' }}>
                                                <input className="input" value={mat.name} onChange={e => handleUpdateMat(mat.id, 'name', e.target.value)} />
                                                <input className="input" value={mat.unit} onChange={e => handleUpdateMat(mat.id, 'unit', e.target.value)} />
                                                <div style={{ position: 'relative' }}>
                                                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>$</span>
                                                    <input className="input" type="number" style={{ paddingLeft: '20px' }} value={mat.price} onChange={e => handleUpdateMat(mat.id, 'price', parseFloat(e.target.value) || 0)} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'plan' && (
                                <div style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto', paddingTop: '2rem' }}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
                                        Plan Actual: {plan === 'Guest' ? 'Gratis (Sin Registro)' : plan}
                                    </h3>

                                    <div className="card" style={{ padding: '2rem', border: plan === 'Profesional' ? '2px solid #10b981' : '2px solid #3b82f6' }}>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                                                {plan === 'Profesional' ? (
                                                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>¡Tenés el Plan Profesional Activo!</span>
                                                ) : (
                                                    <>Estás usando la cuenta <strong>Gratis</strong> con 3 generaciones mensuales.</>
                                                )}
                                            </p>
                                            <ul style={{ listStyle: 'none', textAlign: 'left', margin: '1rem 0', color: 'var(--text-secondary)' }}>
                                                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <Check size={18} color={plan === 'Profesional' ? 'green' : '#3b82f6'} />
                                                    {plan === 'Profesional' ? 'Presupuestos ilimitados' : '3 presupuestos por mes'}
                                                </li>
                                                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <Check size={18} color={plan === 'Profesional' ? 'green' : '#3b82f6'} />
                                                    {plan === 'Profesional' ? 'Carga tus propios productos' : 'Configuración básica'}
                                                </li>
                                                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <Check size={18} color={plan === 'Profesional' ? 'green' : '#3b82f6'} />
                                                    {plan === 'Profesional' ? 'Subí la información de tu empresa' : 'Sin posibilidad de agregar productos'}
                                                </li>
                                                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <Check size={18} color={plan === 'Profesional' ? 'green' : '#3b82f6'} />
                                                    {plan === 'Profesional' ? 'Soporte prioritario' : 'Soporte estándar'}
                                                </li>
                                            </ul>
                                        </div>

                                        {plan !== 'Profesional' && (
                                            <>
                                                <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                                    🚀 <strong>¿Necesitás cotizar sin límites?</strong> Suscribite al plan ilimitado.
                                                </p>


                                                <button
                                                    onClick={onUpgrade}
                                                    className="btn btn-primary"
                                                    style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem' }}
                                                >
                                                    Suscribirme al Plan Ilimitado
                                                </button>

                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                                    Al hacer clic, serás redirigido a Mercado Pago para completar la suscripción de forma segura.
                                                </p>

                                                <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                                                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                                        ¿Ya realizaste el pago?
                                                    </p>
                                                    <button
                                                        className="btn btn-secondary"
                                                        onClick={async () => {
                                                            try {
                                                                const { checkSubscriptionStatus } = await import('@/lib/api');
                                                                const paymentStartTime = sessionStorage.getItem('payment_start_time');
                                                                // Pass timestamp to ensure robust check for recent payment
                                                                const status = await checkSubscriptionStatus(company.id, paymentStartTime ? Number(paymentStartTime) : null);

                                                                if (status.active) {
                                                                    alert('¡Pago confirmado! Tu cuenta ahora es PRO. Recargando...');
                                                                    sessionStorage.removeItem('payment_start_time'); // Clean up on success
                                                                    window.location.reload();
                                                                } else {
                                                                    setShowSupportModal(true);
                                                                }
                                                            } catch (e) {
                                                                console.error(e);
                                                                alert('Error verificando estado.');
                                                            }
                                                        }}
                                                        style={{ fontSize: '0.85rem', width: '100%', justifyContent: 'center' }}
                                                    >
                                                        🔄 Verificar Estado de Suscripción
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                        </main>
                    </div>
                </div>
            </div>

            {/* Support Modal for Subscription Issue */}
            {showSupportModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1100,
                    backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="card" style={{ maxWidth: '450px', width: '90%', textAlign: 'center', padding: '2rem', position: 'relative' }}>
                        <button
                            onClick={() => setShowSupportModal(false)}
                            style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                        >
                            <X size={24} />
                        </button>

                        <div style={{ background: '#eff6ff', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <span style={{ fontSize: '2rem' }}>🤔</span>
                        </div>

                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>
                            ¿No se activó tu plan?
                        </h3>

                        <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '2rem' }}>
                            Si hiciste el pago de la suscripción hace más de 5 minutos y todavía no lo tenés activo, comunicate con soporte por WhatsApp.
                        </p>

                        <a
                            href="https://wa.me/541171918141?text=Hola%20Brandon,%20pagu%C3%A9%20la%20suscripci%C3%BB%C3%B3n%20en%20CotizApp%20y%20todav%C3%ADa%20no%20se%20activa."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                backgroundColor: '#25D366',
                                border: 'none',
                                padding: '1rem',
                                fontSize: '1rem'
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                            Contactar a Soporte (Brandon)
                        </a>

                        <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                            Te responderemos a la brevedad para solucionarlo.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
