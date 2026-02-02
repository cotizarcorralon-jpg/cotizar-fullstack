# cotizAR - Sistema Fullstack de Presupuestos Inteligente

Sistema completo de generación de presupuestos desde mensajes de WhatsApp, con autenticación Google, planes FREE/PRO, y activación automática vía webhook de Mercado Pago.

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + React + Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL + Prisma ORM
- **Autenticación**: NextAuth.js + Google OAuth
- **Pagos**: Mercado Pago (Suscripciones)
- **PDF**: jsPDF + autoTable

## ✨ Características

### Multi-tenant por Empresa
- Cada usuario crea su empresa al primer login
- Owner automático de su empresa
- Gestión de materiales y precios por empresa

### Planes
- **FREE**: 3 presupuestos/mes por empresa
- **PRO**: Presupuestos ilimitados

### Funcionalidades Core
- ✅ Parser inteligente de mensajes WhatsApp
- ✅ Generación automática de presupuestos
- ✅ Gestión de catálogo de materiales
- ✅ Generación de PDF profesionales
- ✅ Historial de cotizaciones
- ✅ Activación automática de plan PRO vía webhook

## 📦 Instalación Local

### 1. Requisitos
- Node.js 18+ 
- PostgreSQL 14+
- Cuenta de Google Cloud (para OAuth)
- Cuenta de Mercado Pago

### 2. Clonar repositorio
\`\`\`bash
git clone https://github.com/tu-usuario/cotizar-fullstack.git
cd cotizar-fullstack
\`\`\`

### 3. Instalar dependencias
\`\`\`bash
npm install
\`\`\`

### 4. Configurar variables de entorno

Copiar `.env.example` a `.env`:
\`\`\`bash
cp .env.example .env
\`\`\`

Editar `.env` con tus credenciales:

\`\`\`env
# App
APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=genera-un-secret-random-aqui

# Database
DATABASE_URL="postgresql://usuario:password@localhost:5432/cotizar_db"

# Google OAuth (crear en cloud.google.com/console)
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=TEST-o-PROD-token-aqui
MERCADOPAGO_PREAPPROVAL_PLAN_ID=f03e1a6abedd4f1fba4947305b598264
\`\`\`

#### Cómo obtener Google OAuth credentials:
1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear nuevo proyecto (o usar existente)
3. Habilitar "Google+ API"
4. Ir a "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Tipo: Web application
6. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copiar Client ID y Client Secret

### 5. Configurar base de datos

\`\`\`bash
# Crear DB en PostgreSQL
createdb cotizar_db

# Ejecutar migraciones
npm run db:push

# Seed con datos de ejemplo (opcional)
npm run db:seed
\`\`\`

### 6. Ejecutar en desarrollo

\`\`\`bash
npm run dev
\`\`\`

Abrir [http://localhost:3000](http://localhost:3000)

## 🗄️ Administrar la Base de Datos

Prisma Studio - Panel web visual:
\`\`\`bash
npm run db:studio
\`\`\`

Abre en [http://localhost:5555](http://localhost:5555)

## 🔐 Configurar Webhook de Mercado Pago

### En desarrollo local (usar ngrok o similar):

1. Instalar ngrok:
\`\`\`bash
npm install -g ngrok
\`\`\`

2. Exponer puerto 3000:
\`\`\`bash
ngrok http 3000
\`\`\`

3. Copiar URL HTTPS (ej: `https://abc123.ngrok.io`)

4. En [Mercado Pago Dashboard](https://www.mercadopago.com.ar/developers/panel):
   - Ir a "Webhooks"
   - Crear nuevo webhook
   - URL: `https://abc123.ngrok.io/api/webhook/mercadopago`
   - Eventos: Seleccionar "Subscriptions" → "preapproval"
   - Guardar

### En producción:

URL webhook: `https://tu-dominio.com/api/webhook/mercadopago`

## 🚢 Deploy a Vercel

### 1. Push a GitHub
\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/cotizar-fullstack.git
git push -u origin main
\`\`\`

### 2. Deploy en Vercel

1. Ir a [vercel.com](https://vercel.com)
2. Importar repositorio de GitHub
3. Configurar variables de entorno (copiar desde `.env`)
4. Deploy!

### 3. Base de datos en producción

Opciones recomendadas:
- [Supabase](https://supabase.com) (PostgreSQL gratis)
- [Neon](https://neon.tech) (PostgreSQL serverless)
- [Railway](https://railway.app) (PostgreSQL con UI)

Actualizar `DATABASE_URL` en Vercel con la URL de producción.

### 4. Actualizar webhook de Mercado Pago

En dashboard de MP, cambiar URL webhook a:
\`\`\`
https://tu-app.vercel.app/api/webhook/mercadopago
\`\`\`

## 📁 Estructura del Proyecto

\`\`\`
cotizar-fullstack/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # NextAuth config
│   │   ├── me/route.ts                   # User/company data
│   │   ├── quote/generate/route.ts       # Generate quote
│   │   ├── quotes/route.ts               # Quote history
│   │   ├── materials/route.ts            # CRUD materials
│   │   ├── company/update/route.ts       # Update company
│   │   ├── billing/start-pro/route.ts    # Start subscription
│   │   └── webhook/mercadopago/route.ts  # MP webhook
│   ├── dashboard/page.tsx                # Main app (protected)
│   ├── login/page.tsx                    # Login with Google
│   ├── page.tsx                          # Landing page
│   ├── layout.tsx                        # Root layout
│   ├── providers.tsx                     # Session provider
│   └── globals.css                       # Global styles
├── lib/
│   ├── prisma.ts                         # Prisma client
│   ├── parser.ts                         # WhatsApp parser
│   └── pdfGenerator.ts                   # PDF generation
├── prisma/
│   ├── schema.prisma                     # Database schema
│   └── seed.js                           # Seed script
├── components/                            # React components
├── .env.example                          # Env template
├── next.config.mjs                       # Next.js config
├── package.json
└── README.md
\`\`\`

## 🔑 Endpoints API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/me` | Datos de usuario/empresa/plan/uso |
| POST | `/api/quote/generate` | Generar presupuesto (valida límite) |
| GET | `/api/quotes` | Historial de cotizaciones |
| GET | `/api/materials` | Listar materiales |
| POST | `/api/materials` | Agregar material |
| PATCH | `/api/materials/[id]` | Editar material |
| DELETE | `/api/materials/[id]` | Eliminar material |
| POST | `/api/company/update` | Actualizar empresa |
| POST | `/api/billing/start-pro` | Iniciar suscripción PRO |
| POST | `/api/webhook/mercadopago` | Webhook de MP |

## 🗃️ Esquema de Base de Datos

### Tablas principales:
- **User**: Usuarios (email, name, image)
- **Company**: Empresas (name, address, logo, etc.)
- **CompanyMember**: Relación User-Company (role)
- **Material**: Catálogo de materiales por empresa
- **Quote**: Cotizaciones generadas
- **Usage**: Contador mensual de cotizaciones
- **Subscription**: Plan y estado de suscripción
- **Account, Session, VerificationToken**: NextAuth

## ❓ FAQ

### ¿Cómo testear el webhook sin deploy?
Usar ngrok (ver sección "Configurar Webhook").

### ¿Cómo cambiar el precio del plan PRO?
En el código de `/api/billing/start-pro/route.ts`, modificar `transaction_amount`.

### ¿Cómo agregar más planes?
1. Crear nuevos planes en Mercado Pago
2. Actualizar `Subscription.plan` enum en schema
3. Agregar lógica en endpoints

### ¿Cómo reset el contador mensual?
Es automático. El sistema usa `monthKey` (YYYY-MM) y crea/actualiza el registro mensualmente.

## 📝 Licencia

MIT

## 💬 Soporte

Para dudas o problemas, abrir un issue en GitHub.

---

**Desarrollado con ❤️ en Argentina**
