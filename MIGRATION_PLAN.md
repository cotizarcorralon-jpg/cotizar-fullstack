# Plan de Migración: Cotizar App (Vite) → Cotizar Fullstack (Next.js)

## REGLA PRINCIPAL
❌ **NO CAMBIAR NADA** - Migrar tal cual está
✅ **SOLO ADAPTAR** el código para que funcione en Next.js

## Origen
`c:\Users\Neo\Desktop\Cotizar app` (Vite + React)

## Destino  
`c:\Users\Neo\Desktop\cotizar-fullstack` (Next.js 15)

## Estrategia de Migración

### 1. Rutas y Páginas
- `index.html` + `App.jsx` → `app/page.tsx` (Landing + Generator en una sola página)
- Mantener mism estructura: Hero → HowItWorks → QuoteGenerator → QuoteResult

### 2. Components (Component por component)
Migrar estos archivos TAL CUAL están:
- Header.jsx → components/Header.tsx
- Hero.jsx → components/Hero.tsx
- HowItWorks.jsx → components/HowItWorks.tsx
- QuoteGenerator.jsx → components/QuoteGenerator.tsx
- QuoteResult.jsx → components/QuoteResult.tsx
- ConfigModal.jsx → components/ConfigModal.tsx
- Login.jsx → components/Login.tsx
- LimitReachedModal.jsx → components/LimitReachedModal.tsx

### 3. Utilities (Sin cambios)
- utils/parsingLogic.js → lib/parser.ts
- utils/pdfGenerator.js → lib/pdfGenerator.ts
- utils/storage.js → lib/storage.ts (mantener localStorage)

### 4. API Layer
- api.js → Mantener como fetch calls a las rutas API de Next.js
- Las rutas API ya están creadas en `/api/*`

### 5. Estilos
- index.css → app/globals.css
- App.css → Mantener estilos inline (están en components)

## Paso a Paso

1. Copiar índex.css a globals.css
2. Crear cada componente manteniendo estructura exacta
3. Crear página principal que use todos los components
4. Mantener localStorage para modo demo
5. Adaptar api.js para llamar a las rutas API de Next.js
6. Probar que TODO funcione EXACTAMENTE igual

## Notas Importantes
- NO usar NextAuth todavía (mantener Login mock)
- NO usar Prisma todavía (mantener localStorage + API endpoints preparados)
- NO cambiar textos, colores, layouts
- NO cambiar lógica de límites demo
- NO cambiar parser
- NO cambiar PDF generator
- Mantener mismo flujo: landing → generator → results
