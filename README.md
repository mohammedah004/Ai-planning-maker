# AI Marketing Planner — SaaS Platform

**AI Marketing Planner** is an AI-powered SaaS application built with Next.js 16 (App Router), Supabase, n8n, NextAuth.js, and Tailwind CSS. It transforms product and brand descriptions into a complete, strategic 30-day Instagram content calendar with automated Google Sheets exports and public shareable links.

---

## 🛠️ Environment Variables Configuration

Copy `.env.example` or create a `.env.local` file in the root directory with the following variables:

```env
# NextAuth.js Configuration
AUTH_SECRET=your_nextauth_secret_key
AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth Credentials
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# Supabase Credentials (Service Role Key for Server Operations)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# n8n Automation Engine Integration
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/generate-plan
N8N_WEBHOOK_SECRET=your_n8n_webhook_secret_key

# OpenAI Direct Integration (Single-Post In-App Regeneration)
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
```

---

## 🚀 Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

---

## 📦 Production Deployment (Vercel)

1. Import the repository into **Vercel**.
2. Add all environment variables listed above in the Vercel Dashboard under **Project Settings > Environment Variables**.
3. Set `AUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production domain (e.g. `https://your-app.vercel.app`).
4. Ensure your Google OAuth Authorized Redirect URI includes: `https://your-app.vercel.app/api/auth/callback/google`.
5. Run production build locally to test:

```bash
npm run build
npm start
```
