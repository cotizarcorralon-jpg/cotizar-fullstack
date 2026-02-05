import React, { useState } from 'react';
import { X, Plus, Search, Check, CreditCard } from 'lucide-react';

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

    // Local state for company form to avoid auto-saving on every keystroke
    const [localCompany, setLocalCompany] = useState(company || {});

    // Sync tab when opening & sync local company data
    React.useEffect(() => {
        if (isOpen) {
            if (initialTab) setActiveTab(initialTab);
            setLocalCompany(company || {});
        }
    }, [isOpen, initialTab, company]);

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

                                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => {
                                            if (window.confirm("¿Guardar cambios de la empresa?")) {
                                                setCompany(localCompany);
                                            }
                                        }}
                                        style={{ width: '100%', justifyContent: 'center' }}
                                    >
                                        💾 Guardar Cambios
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
                                                <CreditCard size={18} />
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
                                                            const status = await checkSubscriptionStatus(company.id);
                                                            if (status.active) {
                                                                alert('¡Pago confirmado! Tu cuenta ahora es PRO. Recargando...');
                                                                window.location.reload();
                                                            } else {
                                                                alert('No se encontró una suscripción activa todavía. Si acabás de pagar, esperá unos instantes.');
                                                            }
                                                        } catch (e) {
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
    );
}
