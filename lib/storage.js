const DEFAULT_MATERIALS = [
  { id: '1', name: 'Cemento (bolsa 25 kg)', unit: 'bolsa', price: 8500, keywords: ['cemento', 'bolsa de cemento', 'cemento 25'] },
  { id: '2', name: 'Cal (bolsa)', unit: 'bolsa', price: 4500, keywords: ['cal', 'cal comun', 'bolsa de cal'] },
  { id: '3', name: 'Arena', unit: 'm3', price: 15000, keywords: ['arena', 'arena fina', 'metros de arena', 'metro de arena', 'mts arena'] },
  { id: '4', name: 'Piedra partida', unit: 'm3', price: 28000, keywords: ['piedra', 'piedra partida', 'metros de piedra'] },
  { id: '5', name: 'Ladrillo Hueco 8x18x33', unit: 'u', price: 300, keywords: ['ladrillo 8', 'hueco 8', 'ladrillo del 8', 'ladrillo hueco 8', 'ladrillos 8'] },
  { id: '6', name: 'Ladrillo Hueco 12x18x33', unit: 'u', price: 350, keywords: ['ladrillo 12', 'hueco 12', 'ladrillo del 12', 'ladrillos', 'huecos', 'ladrillo hueco', 'ladrillos huecos'] },
  { id: '7', name: 'Ladrillo Hueco 18x18x33', unit: 'u', price: 420, keywords: ['ladrillo 18', 'hueco 18', 'ladrillo del 18', 'ladrillos 18'] },
  { id: '8', name: 'Ladrillo Común Macizo', unit: 'u', price: 150, keywords: ['ladrillo comun', 'ladrillo macizo', 'comunes', 'ladrillos comunes'] },
  { id: '9', name: 'Hierro / Acero', unit: 'kg', price: 1200, keywords: ['hierro', 'acero', 'barra de hierro'] },
  { id: '10', name: 'Malla electrosoldada', unit: 'm2', price: 2500, keywords: ['malla', 'malla cima', 'electrosoldada'] },
  { id: '11', name: 'Alambre recocido', unit: 'kg', price: 1800, keywords: ['alambre', 'alambre recocido'] },
  { id: '12', name: 'Adhesivo para cerámicos', unit: 'bolsa', price: 6500, keywords: ['pegamento', 'klaukol', 'adhesivo', 'adhesivo ceramico'] },
  { id: '13', name: 'Revoque premezclado', unit: 'bolsa', price: 6000, keywords: ['revoque', 'premezclado', 'fino', 'grueso'] },
  { id: '14', name: 'Caño PVC cloacal', unit: 'm', price: 3200, keywords: ['caño pvc', 'cloacal', 'tubo pvc'] },
  { id: '15', name: 'Caño termofusión agua', unit: 'm', price: 4500, keywords: ['caño agua', 'termofusion', 'caño verde'] },
  { id: '16', name: 'Membrana asfáltica', unit: 'rollo', price: 45000, keywords: ['membrana', 'rollo de membrana'] },
  { id: '17', name: 'Hidrófugo', unit: 'lt', price: 2500, keywords: ['ceresita', 'hidrofugo'] },
  { id: '18', name: 'Cerámico / porcelanato', unit: 'm2', price: 9000, keywords: ['ceramico', 'porcelanato', 'piso'] },
  { id: '19', name: 'Flete base', unit: 'u', price: 25000, keywords: ['flete', 'envio'] },
];

const DEFAULT_COMPANY = {
  name: 'Corralón El Constructor',
  address: 'Av. Libertador 1234, Buenos Aires',
  whatsapp: '5491112345678',
  email: 'ventas@elconstructor.com',
  web: 'www.elconstructor.com.ar',
  terms: 'Presupuesto válido por 7 días. Precios sujetos a cambio sin previo aviso. Flete no incluido.',
  logo: null // We'll handle file uploads later or use a placeholder
};

export const getStoredMaterials = () => {
  const stored = localStorage.getItem('cotizar_materials_v2');
  return stored ? JSON.parse(stored) : DEFAULT_MATERIALS;
};

export const saveMaterials = (materials) => {
  localStorage.setItem('cotizar_materials_v2', JSON.stringify(materials));
};

export const getStoredCompany = () => {
  const stored = localStorage.getItem('cotizar_company');
  return stored ? JSON.parse(stored) : DEFAULT_COMPANY;
};

export const saveCompany = (company) => {
  localStorage.setItem('cotizar_company', JSON.stringify(company));
};

export const getStoredPlan = () => {
  return localStorage.getItem('cotizar_plan') || 'Free';
};

export const savePlan = (plan) => {
  localStorage.setItem('cotizar_plan', plan);
};
