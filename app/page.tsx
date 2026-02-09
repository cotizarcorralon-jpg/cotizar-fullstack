'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useSession } from "next-auth/react";
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import QuoteGenerator from '@/components/QuoteGenerator';
import QuoteResult from '@/components/QuoteResult';
import ConfigModal from '@/components/ConfigModal';
import Login from '@/components/Login';
import LimitReachedModal from '@/components/LimitReachedModal';
import OnboardingModal from '@/components/OnboardingModal';

import { login, generateQuote, getMaterials, addMaterial, updateMaterial, updateCompany, upgradeSubscription, createCheckoutSession, getOrCreateCompany } from '@/lib/api';
import { generatePDF } from '@/lib/pdfGenerator';

// Default materials for localStorage-only users
const DEFAULT_MATERIALS = [
  { id: 1, name: 'Cemento (bolsa 25 kg)', unit: 'bolsa', price: 8500, keywords: ['cemento', 'bolsa de cemento', 'cemento 25'] },
  { id: 2, name: 'Cal (bolsa)', unit: 'bolsa', price: 4500, keywords: ['cal', 'cal comun', 'bolsa de cal'] },
  { id: 3, name: 'Arena', unit: 'm3', price: 15000, keywords: ['arena', 'arena fina', 'metros de arena', 'metro de arena', 'mts arena'] },
  { id: 4, name: 'Piedra partida', unit: 'm3', price: 28000, keywords: ['piedra', 'piedra partida', 'metros de piedra'] },
  { id: 8, name: 'Ladrillo Común', unit: 'u', price: 100, keywords: ['ladrillo comun', 'ladrillo común', 'ladrillos comunes'] },
  { id: 5, name: 'Ladrillo Hueco 8x18x33', unit: 'u', price: 300, keywords: ['ladrillo 8', 'hueco 8', 'ladrillo del 8', 'ladrillo hueco 8', 'ladrillos 8'] },
  { id: 6, name: 'Ladrillo Hueco 12x18x33', unit: 'u', price: 350, keywords: ['ladrillo 12', 'hueco 12', 'ladrillo del 12', 'ladrillos', 'huecos', 'ladrillo hueco', 'ladrillos huecos'] },
  { id: 7, name: 'Hierro / Acero (kg)', unit: 'kg', price: 1200, keywords: ['hierro', 'acero', 'barra del', 'hierro del'] }
];

export default function Home() {
  // Global State
  const [user, setUser] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);

  // UI State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [configTab, setConfigTab] = useState('company');
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  // Demo / Auth State
  const [demoQuoteCount, setDemoQuoteCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authReason, setAuthReason] = useState('generic');

  const [quoteItems, setQuoteItems] = useState<any[]>([]);
  const [quoteTotal, setQuoteTotal] = useState(0);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showPalletInfo, setShowPalletInfo] = useState(false);

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
      return 0;
    } catch {
      return 0;
    }
  };

  // Helper: Set demo quote count to localStorage
  const setDemoQuoteCountStorage = (count: number) => {
    localStorage.setItem('cotizar_demo', JSON.stringify({
      month: getMonthKey(),
      count: count
    }));
  };

  // NextAuth Sync
  const { data: sessionData, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && sessionData?.user) {
      setUser(sessionData.user);
      localStorage.setItem('cotizar_user', JSON.stringify(sessionData.user));

      // Fetch company from DB to ensure we have the correct data and trigger material population
      const userId = (sessionData.user as any).id;
      if (userId) {
        getOrCreateCompany(userId)
          .then(dbCompany => {
            setCompany(dbCompany);
            localStorage.setItem('cotizar_company', JSON.stringify(dbCompany));
            refreshMaterials(dbCompany.id);
          })
          .catch(e => console.error("Error fetching authenticated company", e));
      }

      // Sync demo count from storage so we don't show 0/3 if they already used some
      setDemoQuoteCount(getDemoQuoteCount());
    }
  }, [status, sessionData]);

  // Helper: Refresh materials
  const refreshMaterials = async (companyId: string) => {
    if (companyId === 'local') {
      const stored = localStorage.getItem('cotizar_materials');
      setMaterials(stored ? JSON.parse(stored) : DEFAULT_MATERIALS);
    } else {
      try {
        const mats = await getMaterials(companyId);
        setMaterials(mats);
      } catch (e) {
        console.error("Failed to load materials", e);
      }
    }
  };

  // Load User from Local Storage if available (Fallback)
  useEffect(() => {
    if (status === 'authenticated') return; // Don't overwrite if NextAuth is active

    const loadLocalData = () => {
      try {
        const storedUser = localStorage.getItem('cotizar_user');
        const storedCompany = localStorage.getItem('cotizar_company');
        const storedMaterials = localStorage.getItem('cotizar_materials');
        const storedCount = localStorage.getItem('demoQuoteCount');

        if (storedCount) setDemoQuoteCount(Number(storedCount));

        if (storedUser && storedUser !== "undefined") {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

            // Fetch real company from DB to ensure valid payments
            getOrCreateCompany(parsedUser.id).then(dbCompany => {
              if (dbCompany && dbCompany.id) {
                setCompany(dbCompany);
                localStorage.setItem('cotizar_company', JSON.stringify(dbCompany));
                refreshMaterials(dbCompany.id);
              }
            });
          } catch (e) {
            console.error("Error parsing user", e);
            localStorage.removeItem('cotizar_user');
          }
        }

        let comp = null;
        if (storedCompany && storedCompany !== "undefined") {
          try {
            comp = JSON.parse(storedCompany);
            setCompany(comp);
          } catch (e) {
            console.error("Error parsing company", e);
          }
        }

        if (!comp) {
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
          comp = defaultCompany;
        }

        if (comp?.id) refreshMaterials(comp.id);

        if (!storedMaterials) {
          localStorage.setItem('cotizar_materials', JSON.stringify(DEFAULT_MATERIALS));
        }

      } catch (err) {
        console.error("General storage error", err);
      }
    };

    loadLocalData();
  }, [status]);

  const handleHeroClick = () => {
    // Only show onboarding if user is NOT logged in or has default local company
    if (!user || company?.id === 'local') {
      setShowOnboarding(true);
    } else {
      scrollToQuote();
    }
  };

  const handleGenerate = async (text: string) => {
    // Determine the company ID to use. 
    // If user is logged in, use their company ID.
    // If user is NOT logged in (Demo), pass null/undefined to let API handle it as Guest/Demo.
    const companyId = user ? company?.id : null;

    // Check local demo limit first for immediate feedback (UX)
    if (!user) {
      const currentCount = getDemoQuoteCount();
      if (currentCount >= 3) {
        setAuthReason('limit');
        setShowAuthModal(true);
        return;
      }
    } else if (company?.plan === 'Guest' && getDemoQuoteCount() >= 3) {
      // Logged in Guest Check
      setIsLimitModalOpen(true);
      return;
    }

    try {
      // Call API for ALL users (Demo & Logged In) to enforce IP limits
      const result = await generateQuote(text, companyId || undefined);

      setQuoteItems(result.items);
      setQuoteTotal(result.total);
      setShowPalletInfo(result.hasPallets || false);
      setHasGenerated(true);

      // Increment local counters for UI feedback
      if (!user || (company?.plan === 'Guest')) {
        const newCount = getDemoQuoteCount() + 1;
        setDemoQuoteCount(newCount);
        setDemoQuoteCountStorage(newCount);
      }

      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);

    } catch (err: any) {
      if (err.message.includes('Límite diario') || err.message.includes('Límite de prueba') || err.code === 'LIMIT_REACHED' || err.status === 429) {
        if (!user) {
          setAuthReason('limit');
          setShowAuthModal(true);
        } else {
          setIsLimitModalOpen(true);
        }
      } else {
        alert("Error generando presupuesto: " + err.message);
      }
    }
  };

  const handleExample = async () => {
    const exampleText =
      "Hola, necesito 10 bolsas de cemento 25kg, 2 m3 de arena, 5 kg de hierro y 1 pallet de ladrillo hueco 12x18x33. Gracias.";
    await handleGenerate(exampleText);
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const newItems = [...quoteItems];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate subtotal if price or quantity changes
    if (field === 'price' || field === 'quantity') {
      newItems[index].subtotal = newItems[index].quantity * newItems[index].price;
    }

    setQuoteItems(newItems);
    setQuoteTotal(newItems.reduce((acc, item) => acc + item.subtotal, 0));
  };

  const handleDownload = () => {
    // Generate simplified unique ID for "Internal Order" simulation
    const quoteNumber = `N${Date.now().toString().slice(-6)}`;
    generatePDF(company, quoteItems, quoteTotal, quoteNumber);
  };

  const scrollToQuote = () => {
    const el = document.getElementById('quote-generator');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCompanyUpdate = async (newComp: any) => {
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

  const handleAddMaterial = async (mat: any) => {
    if (company.id === 'local') {
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

  const handleMaterialUpdate = async (id: number, mat: any) => {
    const newMats = materials.map(m => (m as any).id === id ? mat : m);
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
    if (!company?.id) {
      alert("Error: No se encontró el ID de usuario.");
      return;
    }

    try {
      sessionStorage.setItem('pending_upgrade_check', 'true');
      sessionStorage.setItem('payment_start_time', Date.now().toString());

      const emailToUse = company.email || user?.email;
      const response = await createCheckoutSession(company.id, emailToUse);
      if (response.url) {
        window.location.href = response.url;
      } else {
        alert("Error generando el link de pago.");
      }
    } catch (e) {
      console.error(e);
      alert("Error iniciando el pago. Intenta nuevamente.");
    }
  };

  // Check for pending upgrade on mount
  useEffect(() => {
    const checkUpgrade = async () => {
      const isPending = sessionStorage.getItem('pending_upgrade_check');
      const paymentStartTime = sessionStorage.getItem('payment_start_time');

      if (isPending && company?.id && company.id !== 'local' && company.plan !== 'Profesional') {
        try {
          const { checkSubscriptionStatus } = await import('@/lib/api');
          const status = await checkSubscriptionStatus(company.id, (paymentStartTime ? Number(paymentStartTime) : null) as any);

          if (status.active) {
            alert("¡Pago confirmado! Tu cuenta ahora es PRO.");
            sessionStorage.removeItem('pending_upgrade_check');
            sessionStorage.removeItem('payment_start_time');
            window.location.reload();
          } else {
            console.log("Pago no detectado aún.");
          }
        } catch (e) {
          console.error("Error checking status", e);
        }
      }
    };

    if (user && company) {
      checkUpgrade();
    }
  }, [user, company]);


  return (
    <div className="App">
      <Header
        onOpenConfig={() => { setConfigTab('company'); setIsConfigOpen(true); }}
        user={user}
        plan={company?.plan}
        onLoginClick={() => { setAuthReason('generic'); setShowAuthModal(true); }}
      />

      <main>
        <Hero onScrollToQuote={handleHeroClick} />
        <HowItWorks />

        <QuoteGenerator
          plan={user ? company?.plan : (demoQuoteCount >= 3 ? 'DemoLimit' : 'Guest')}
          demoQuoteCount={(!user || company?.plan === 'Guest') ? demoQuoteCount : null}
          onGenerate={handleGenerate}
          onClear={() => {
            setQuoteItems([]);
            setHasGenerated(false);
            setShowPalletInfo(false);
          }}
          onExample={handleExample}
          isDemo={!user}
        />

        {hasGenerated && (
          <QuoteResult
            items={quoteItems}
            total={quoteTotal}
            company={company || { name: 'Empresa Demo (Vista Previa)', address: 'Dirección Ejemplo 123', whatsapp: '5491112345678', email: 'demo@email.com' }}
            onUpdateItem={handleUpdateItem}
            onAddItem={() => {
              setQuoteItems([...quoteItems, { quantity: 1, unit: 'u', name: '', price: 0, subtotal: 0 }]);
            }}
            onDownload={handleDownload}
            showPalletInfo={showPalletInfo}
            isDemo={!user}
          />
        )}
      </main>

      {/* MODALS */}

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onConfigure={() => {
          setShowOnboarding(false);
          setConfigTab('company');
          setIsConfigOpen(true);
        }}
        onSkip={() => {
          setShowOnboarding(false);
          scrollToQuote();
        }}
      />

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
              <Login onLogin={() => setShowAuthModal(false)} isModal={true} />
            </div>
          </div>
        </div>
      )}

      <LimitReachedModal
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        onUpgrade={handleUpgrade}
      />


      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        company={company}
        setCompany={handleCompanyUpdate}
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
