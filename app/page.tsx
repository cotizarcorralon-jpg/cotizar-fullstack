import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import QuoteGenerator from './components/QuoteGenerator';
import QuoteResult from './components/QuoteResult';
import ConfigModal from './components/ConfigModal';
import Login from './components/Login';
import LimitReachedModal from './components/LimitReachedModal';

import { login, generateQuote, generateDemoQuote, getMaterials, addMaterial, updateMaterial, updateCompany, upgradeSubscription } from './api';
import { generatePDF } from './utils/pdfGenerator';
import { parseMessage } from './utils/parsingLogic';

// Default materials for localStorage-only users
const DEFAULT_MATERIALS = [
  { id: 1, name: 'Cemento (bolsa 25 kg)', unit: 'bolsa', price: 8500, keywords: ['cemento', 'bolsa de cemento', 'cemento 25'] },
  { id: 2, name: 'Cal (bolsa)', unit: 'bolsa', price: 4500, keywords: ['cal', 'cal comun', 'bolsa de cal'] },
  { id: 3, name: 'Arena', unit: 'm3', price: 15000, keywords: ['arena', 'arena fina', 'metros de arena', 'metro de arena', 'mts arena'] },
  { id: 4, name: 'Piedra partida', unit: 'm3', price: 28000, keywords: ['piedra', 'piedra partida', 'metros de piedra'] },
  { id: 5, name: 'Ladrillo Hueco 8x18x33', unit: 'u', price: 300, keywords: ['ladrillo 8', 'hueco 8', 'ladrillo del 8', 'ladrillo hueco 8', 'ladrillos 8'] },
  { id: 6, name: 'Ladrillo Hueco 12x18x33', unit: 'u', price: 350, keywords: ['ladrillo 12', 'hueco 12', 'ladrillo del 12', 'ladrillos', 'huecos', 'ladrillo hueco', 'ladrillos huecos'] },
  { id: 7, name: 'Hierro / Acero (kg)', unit: 'kg', price: 1200, keywords: ['hierro', 'acero', 'barra del', 'hierro del'] }
];

function App() {
  // ... (state remains same)
  // We need to keep the state declarations if I'm not replacing the whole file. 
  // Wait, I can't replace imports easily if I target lines in the middle.

  // Let's target the exact lines for handlers.

  // Global State
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [materials, setMaterials] = useState([]);

  // UI State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configTab, setConfigTab] = useState('company');
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  // Demo / Auth State
  const [demoQuoteCount, setDemoQuoteCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authReason, setAuthReason] = useState('generic'); // 'generic', 'download', 'limit'

  const [quoteItems, setQuoteItems] = useState([]);

  // Helper: Get current month key
  const getMonthKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  // Helper: Get demo quote count from localStorage
  const getDemoQuoteCount = () => {
    const stored = localStorage.getItem('cotizar_demo');
    if (!stored) return 0;
    try {
      const data = JSON.parse(stored);
      if (data.month === getMonthKey()) {
        return data.count || 0;
      }
      return 0; // Reset if different month
    } catch {
      return 0;
    }
  };

  // Helper: Set demo quote count to localStorage
  const setDemoQuoteCountStorage = (count) => {
    localStorage.setItem('cotizar_demo', JSON.stringify({
      month: getMonthKey(),
      count: count
    }));
  };
  const [quoteTotal, setQuoteTotal] = useState(0);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showPalletInfo, setShowPalletInfo] = useState(false);

  // Load User from Local Storage if available (simple persistence)
  useEffect(() => {
    const storedUser = localStorage.getItem('cotizar_user');
    const storedCompany = localStorage.getItem('cotizar_company');
    const storedMaterials = localStorage.getItem('cotizar_materials');

    if (storedUser && storedCompany) {
      // Logged in user
      setUser(JSON.parse(storedUser));
      const comp = JSON.parse(storedCompany);
      setCompany(comp);
      refreshMaterials(comp.id);
    } else {
      // Guest user - initialize with defaults
      if (!storedCompany) {
        const defaultCompany = {
          id: 'local',
          name: 'Mi Empresa',
          address: 'Dirección de ejemplo',
          whatsapp: '5491112345678',
          email: 'contacto@ejemplo.com',
          plan: 'Guest'
        };
        localStorage.setItem('cotizar_company', JSON.stringify(defaultCompany));
        setCompany(defaultCompany);
      } else {
        setCompany(JSON.parse(storedCompany));
      }

      if (!storedMaterials) {
        localStorage.setItem('cotizar_materials', JSON.stringify(DEFAULT_MATERIALS));
        setMaterials(DEFAULT_MATERIALS);
      } else {
        setMaterials(JSON.parse(storedMaterials));
      }

      // Load demo quote count
      setDemoQuoteCount(getDemoQuoteCount());
    }
  }, []);

  const refreshMaterials = async (companyId) => {
    if (companyId === 'local') {
      // Load from localStorage
      const stored = localStorage.getItem('cotizar_materials');
      setMaterials(stored ? JSON.parse(stored) : DEFAULT_MATERIALS);
    } else {
      // Load from backend
      try {
        const mats = await getMaterials(companyId);
        setMaterials(mats);
      } catch (e) {
        console.error("Failed to load materials", e);
      }
    }
  };

  const handleLogin = async (mockUser) => {
    try {
      const session = await login(mockUser);
      setUser(session.user);
      setCompany(session.company);

      // Persist
      localStorage.setItem('cotizar_user', JSON.stringify(session.user));
      localStorage.setItem('cotizar_company', JSON.stringify(session.company));

      refreshMaterials(session.company.id);
      setShowAuthModal(false);

      // Clear guest data
      localStorage.removeItem('cotizar_materials');
      localStorage.removeItem('cotizar_demo');
    } catch (err) {
      alert("Error iniciando sesión: " + err.message);
    }
  };

  // Generate Logic
  const handleGenerate = async (text) => {
    // Demo Mode Logic (Guest users get 3 free quotes/month)
    if (!user) {
      const currentCount = getDemoQuoteCount();
      if (currentCount >= 3) {
        setAuthReason('limit');
        setShowAuthModal(true);
        return;
      }
      try {
        // Use local parseMessage with localStorage materials
        const items = parseMessage(text, materials);
        const total = items.reduce((acc, item) => acc + item.subtotal, 0);

        setQuoteItems(items);
        setQuoteTotal(total);
        setShowPalletInfo(items.hasPallets || false);
        setHasGenerated(true);

        // Increment and save demo count
        const newCount = currentCount + 1;
        setDemoQuoteCount(newCount);
        setDemoQuoteCountStorage(newCount);

        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
      } catch (err) {
        alert("Error: " + err.message);
      }
      return;
    }

    if (!company) return;

    try {
      const result = await generateQuote(text, company.id);

      setQuoteItems(result.items);
      setQuoteTotal(result.total);
      setShowPalletInfo(result.hasPallets || false);
      setHasGenerated(true);

      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);

    } catch (err) {
      if (err.code === 'LIMIT_REACHED') {
        setIsLimitModalOpen(true);
      } else {
        alert("Error generando presupuesto: " + err.message);
      }
    }
  };

  // Update Logic (Client side for now until endpoints are fully integrated in UI)
  const handleUpdateItem = (index, newPrice) => {
    const newItems = [...quoteItems];
    newItems[index].price = newPrice;
    newItems[index].subtotal = newItems[index].quantity * newPrice;
    setQuoteItems(newItems);
    setQuoteTotal(newItems.reduce((acc, item) => acc + item.subtotal, 0));
  };

  const handleDownload = () => {
    generatePDF(company, quoteItems, quoteTotal);
  };

  const scrollToQuote = () => {
    const el = document.getElementById('quote-generator');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper to sync company state from ConfigModal
  const handleCompanyUpdate = async (newComp) => {
    setCompany(newComp);
    localStorage.setItem('cotizar_company', JSON.stringify(newComp));

    if (company.id !== 'local') {
      try {
        await updateCompany(company.id, newComp);
      } catch (e) {
        console.error("Failed to save company", e);
      }
    }
  };

  const handleAddMaterial = async (mat) => {
    if (company.id === 'local') {
      // LocalStorage
      const newMat = { ...mat, id: Date.now() };
      const newMats = [...materials, newMat];
      setMaterials(newMats);
      localStorage.setItem('cotizar_materials', JSON.stringify(newMats));
    } else {
      try {
        await addMaterial(mat, company.id);
        refreshMaterials(company.id);
      } catch (e) {
        alert("Error agregando material");
      }
    }
  };

  const handleMaterialUpdate = async (id, mat) => {
    // Optimistic update
    const newMats = materials.map(m => m.id === id ? mat : m);
    setMaterials(newMats);

    if (company.id === 'local') {
      localStorage.setItem('cotizar_materials', JSON.stringify(newMats));
    } else {
      try {
        await updateMaterial(id, mat);
      } catch (e) {
        console.error("Update failed", e);
        refreshMaterials(company.id);
      }
    }
  };

  const handleUpgrade = async () => {
    try {
      await upgradeSubscription(company.id);
      const newComp = { ...company, plan: 'Profesional' };
      setCompany(newComp);
      localStorage.setItem('cotizar_company', JSON.stringify(newComp));
      alert("¡Plan Profesional activado!");
    } catch (e) {
      alert("Error activando plan");
    }
  };

  return (
    <div className="App">
      <Header
        onOpenConfig={() => { setConfigTab('company'); setIsConfigOpen(true); }}
        user={user}
        plan={company?.plan}
        onLoginClick={() => { setAuthReason('generic'); setShowAuthModal(true); }}
      />

      <main>
        <Hero onScrollToQuote={scrollToQuote} />
        <HowItWorks />

        <QuoteGenerator
          plan={user ? company?.plan : (demoQuoteCount >= 3 ? 'DemoLimit' : 'Guest')}
          demoQuoteCount={user ? null : demoQuoteCount}
          onGenerate={handleGenerate}
          onClear={() => {
            setQuoteItems([]);
            setHasGenerated(false);
            setShowPalletInfo(false);
          }}
          isDemo={!user}
        />

        {hasGenerated && (
          <QuoteResult
            items={quoteItems}
            total={quoteTotal}
            company={company || { name: 'Empresa Demo (Vista Previa)', address: 'Dirección Ejemplo 123', whatsapp: '5491112345678', email: 'demo@email.com' }}
            onUpdateItem={handleUpdateItem}
            onDownload={handleDownload}
            showPalletInfo={showPalletInfo}
            isDemo={!user}
          />
        )}
      </main>

      {/* Auth Modal Triggered by Actions */}
      {showAuthModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 3000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '450px', margin: '1rem' }}>
            <button
              onClick={() => setShowAuthModal(false)}
              style={{ position: 'absolute', right: '10px', top: '10px', background: 'transparent', border: 'none', cursor: 'pointer', zIndex: 10 }}
            >
              <X size={24} color="#64748b" />
            </button>
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden' }}>
              {authReason === 'download' && (
                <div style={{ background: '#fef3c7', padding: '1rem', textAlign: 'center', borderBottom: '1px solid #fcd34d' }}>
                  <p style={{ color: '#92400e', fontWeight: 'bold', margin: 0 }}>
                    🔒 Creá tu cuenta para descargar el PDF
                  </p>
                </div>
              )}
              {authReason === 'limit' && (
                <div style={{ background: '#e0f2fe', padding: '1rem', textAlign: 'center', borderBottom: '1px solid #bae6fd' }}>
                  <p style={{ color: '#0369a1', fontWeight: 'bold', margin: 0 }}>
                    🚀 Alcanzaste el límite gratuito (3 cotizaciones/mes)
                  </p>
                  <p style={{ color: '#0369a1', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                    Registrate gratis para continuar
                  </p>
                </div>
              )}
              {authReason === 'generic' && (
                <div style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                  <p style={{ fontWeight: 'bold', margin: 0, color: '#334155' }}>
                    👋 Iniciar Sesión / Registrarse
                  </p>
                </div>
              )}
              <Login onLogin={handleLogin} isModal={true} />
            </div>
          </div>
        </div>
      )}

      <LimitReachedModal
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        onSubscribe={() => {
          setIsLimitModalOpen(false);
          setConfigTab('plan');
          setIsConfigOpen(true);
        }}
      />

      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        company={company} setCompany={handleCompanyUpdate}
        materials={materials}
        onAddMaterial={handleAddMaterial}
        onUpdateMaterial={handleMaterialUpdate}
        plan={company?.plan}
        onUpgrade={handleUpgrade}
        initialTab={configTab}
      />
    </div>
  );
}

export default App;
