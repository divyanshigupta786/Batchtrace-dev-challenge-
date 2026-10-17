# BatchTrace Agent — Complete Deployment Guide

This guide details how to deploy the full **BatchTrace Agent** stack into production across Vercel, Supabase, Render, and hosted open-weight inference.

---

## 1. Architecture Deployment Matrix

| Service | Hosting Target | Free Tier Notes & Limitations |
|---|---|---|
| **Frontend & Next.js Routes** | **Vercel** | Free hobby tier, unlimited static pages, 10s serverless function timeout |
| **Relational Database & Auth** | **Supabase** | Free tier includes 500 MB PostgreSQL, Row-Level Security, 50,000 MAU |
| **Python FastAPI Microservice** | **Render** or **Fly.io** | Free tier spins down on inactivity (~50s cold start). Keep-alive ping recommended |
| **Open-Weight AI Model** | **Ollama** (Dev) / **Together AI / Groq / Ollama Cloud** | Configurable via adapter; automatic deterministic fallback when inference is offline |

---

## 2. Step-by-Step Deployment

### Step 1: Deploy Database on Supabase

1. Create a free account at [supabase.com](https://supabase.com).
2. Click **New Project** and name it `batchtrace-production`.
3. In the left navigation, open the **SQL Editor**.
4. Click **New Query**, open the project's migration file:
   [`supabase/migrations/20261017000000_batchtrace_schema.sql`](file:///c:/Users/india/OneDrive/Desktop/dev%20challenge%203/supabase/migrations/20261017000000_batchtrace_schema.sql)
5. Paste the complete SQL and click **Run**.
   - This creates all 17 tables, foreign key constraints, indexes, RLS policies, and audit triggers.
6. Navigate to **Project Settings &rarr; API** and copy:
   - **Project URL** (`https://xyzcompany.supabase.co`)
   - **anon public API key**
   - **service_role secret key**

---

### Step 2: Deploy Python FastAPI Service on Render

#### Option A: Render Blueprints (Recommended)
1. Fork or push this repository to GitHub.
2. Sign in to [render.com](https://render.com).
3. Click **New &rarr; Blueprint** and select your repository.
4. Render will detect [`render.yaml`](file:///c:/Users/india/OneDrive/Desktop/dev%20challenge%203/render.yaml) automatically:
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/health`
5. Click **Apply**.
6. Once deployed, note your service URL:
   `https://batchtrace-backend.onrender.com`

#### Option B: Docker Container
```bash
cd backend
docker build -t batchtrace-backend .
docker run -p 8000:8000 batchtrace-backend
```

---

### Step 3: Deploy Frontend on Vercel

1. Push your code to GitHub.
2. Sign in to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your `batchtrace-agent` repository.
4. Framework Preset will be automatically detected as **Next.js**.
5. In **Environment Variables**, add:

```env
NEXT_PUBLIC_APP_URL=https://your-vercel-deployment.vercel.app

# Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Python Backend URL (from Render)
FASTAPI_BACKEND_URL=https://batchtrace-backend.onrender.com

# AI Inference Options
AI_MODEL_PROVIDER=hosted
HOSTED_INFERENCE_URL=https://api.together.xyz/v1/chat/completions
HOSTED_INFERENCE_API_KEY=your-together-ai-key
HOSTED_INFERENCE_MODEL=Qwen/Qwen2.5-3B-Instruct
```

6. Click **Deploy**. Vercel will build and deploy your app in under 2 minutes.

---

### Step 4: Configuring AI Inference

The **BatchTrace Model Adapter** supports three modes:

#### 1. Local Development (Ollama)
```bash
ollama run qwen2.5:3b
# Or Qwen 3
```
Set in `.env.local`:
```env
AI_MODEL_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b
```

#### 2. Hosted Cloud Inference (Production)
Compatible with any OpenAI-compatible endpoint (Together AI, Groq, DeepInfra, vLLM):
```env
AI_MODEL_PROVIDER=hosted
HOSTED_INFERENCE_URL=https://api.together.xyz/v1/chat/completions
HOSTED_INFERENCE_API_KEY=<your-key>
HOSTED_INFERENCE_MODEL=Qwen/Qwen2.5-3B-Instruct
```

#### 3. Zero-Config Deterministic Fallback Mode
If no AI endpoint is configured or inference is offline:
- The system automatically enters **Deterministic Fallback Mode**.
- The AI Agent workspace executes the 4 controlled tools directly against the database and formats the results cleanly.
- **Zero crashes, zero downtime.**

---

## 3. Post-Deployment Verification Checklist

- [ ] Visit `https://your-deployment.vercel.app/` &rarr; Verify the 3D TraceSphere renders.
- [ ] Visit `/app` &rarr; Verify dashboard metrics and data quality panel load.
- [ ] Visit `/app/trace?search=L-204` &rarr; Verify forward trace graph for lot L-204 loads.
- [ ] Visit `/app/agent` &rarr; Send prompt: *"Supplier lot L-204 has been flagged. Which production batches and customer orders are affected?"*
- [ ] Visit `/app/documents` &rarr; Check side-by-side coordinate extraction preview.
- [ ] Test print view on `/app/incidents/INC-2026-001` &rarr; Verify clean print CSS layout.

---

## 4. Cold Starts & Known Limitations

1. **Render Free Tier Spin-Down**:
   - If idle for 15 minutes, Render sleeps the Python container.
   - The first request may take ~50 seconds.
   - Next.js route handlers handle this gracefully with timeout fallbacks.
2. **Supabase Inactivity**:
   - Free Supabase projects pause after 1 week of zero queries. Visit the Supabase dashboard to unpause if needed.
3. **Vercel Serverless Function Limits**:
   - Serverless functions have a 10s execution limit on free hobby accounts. The deterministic graph search executes in < 50ms, well within this limit.
