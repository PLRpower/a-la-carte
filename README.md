<p align="center">
  <img src="public/logo-transparent.png" alt="À la carte Logo" width="120" />
</p>

<h1 align="center">À la carte</h1>

<p align="center">
  <strong>The modern, collaborative kitchen operating system for families.</strong><br>
  Plan meals, track pantry inventory in real-time, generate smart shopping lists, and cook effortlessly with AI.
</p>

<p align="center">
  <a href="https://a-la-carte-app.vercel.app/"><strong>Launch Live Demo</strong></a> •
  <a href="https://github.com/PLRpower/a-la-carte-app"><strong>GitHub Repository</strong></a> •
  <a href="#key-features--technical-highlights"><strong>Explore Features</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />
  <img src="https://img.shields.io/badge/PWA-Ready-orange?style=for-the-badge" alt="PWA Ready" />
</p>

---

## Table of Contents

1. [Context & Vision](#context--vision)
2. [Key Features & Technical Highlights](#key-features--technical-highlights)
3. [Architectural Overview](#architectural-overview)
4. [Database Design & Security](#database-design--security)
5. [Tech Stack](#tech-stack)
6. [Getting Started & Installation](#getting-started--installation)
7. [Engineering Challenges & Learnings](#engineering-challenges--learnings)
8. [AI Agent Guidelines](#ai-agent-guidelines)
9. [Author & Credits](#author--credits)

---

## Context & Vision

Managing everyday food logistics across a household is notoriously fragmented. Families juggle disconnected notes, lose track of pantry items, waste food, and struggle with the perennial question: *"What are we cooking tonight?"*

**À la carte** was built to unify the entire kitchen lifecycle into a single, cohesive, and delightful platform. Rather than treating recipes, pantry items, and shopping lists as isolated silos, À la carte connects them through an automated, real-time collaborative system:

- **Zero-Friction Family Collaboration**: Built from the ground up around a private "Family" circle where all household members share live, synchronized access to inventory, menus, and shopping carts.
- **Multi-Modal Recipe Ingestion**: Import recipes in seconds—via URL web scraping, camera OCR scans of handwritten family recipe cards, or generative AI tailored to what's already in the fridge.
- **Anti-Waste Intelligence**: Bridge pantry stock with meal planning to cut down grocery bills and reduce food waste.
- **Mobile-First Progressive Web App**: Optimized for high usability on kitchen counters and one-handed supermarket runs.

---

## Key Features & Technical Highlights

### 1. Real-Time Collaborative Family Hub
- **Seamless Peer-to-Peer Group Sharing**: Household members join a private Family workspace using secure email invites and tokens.
- **Instant Synchronization**: Any ingredient added to the pantry or checked off the shopping list updates instantly across all family members' devices without page refreshes.
- **Zero-Friction Permissions**: Built upon PostgreSQL Row-Level Security (RLS), eliminating clunky public/private toggles in favor of unified group governance.

### 2. Intelligent Recipe Management
- **Multi-Modal Creation Pipeline**:
  - **Manual Entry**: Guided creation flow with automatic ingredient and quantity parsing.
  - **AI Chef (Gemini API)**: Analyzes current pantry ingredients to invent balanced, delicious recipes on demand (`suggest-recipe` Edge Function).
  - **URL Web Scraper**: Ingests cooking recipes from external food websites in one click (`scrape-recipe` Edge Function).
  - **OCR Vision Scanner**: Uses computer vision to photograph physical cookbook pages or handwritten recipe cards and turn them into structured, editable digital recipes (`scan-recipe-image` Edge Function).
- **Cold-Start Elimination & Starter Packs**:
  - Preloaded with a curated catalogue of **108 verified recipes** with structured ingredients, times, and portions.
  - Instant onboarding with thematic **Starter Packs** (*Quick & Easy*, *Student / Budget*, *Vegetarian*, *Family Meals*, *Batch Cooking*, *Pastry*).
- **Interactive Guest Demo Mode**: Unauthenticated visitors can freely test-drive the application, browse the catalogue, and preview detailed recipes before signing up.

### 3. Live Inventory & Pantry Management
- **Categorized Stock Tracking**: Ingredients organized into intuitive categories (Fresh, Produce, Dairy, Meat, Pantry, Spices, Beverages).
- **Unit & Quantity Management**: Supports precise metric, imperial, and piece-based tracking with automatic low-stock notifications.

### 4. Smart Interactive Shopping List
- **Aisle-Optimized Layout**: Grocery items automatically categorized by supermarket sections to streamline in-store shopping.
- **Optimistic UI Updates**: Instant checkbox toggling with fast local cache reconciliation via TanStack Query.

### 5. Premium Subscription System
- **Monetization Architecture**: Integrated with Stripe Checkout, customer billing portal, and secure serverless webhook event listeners (`stripe-webhook`).
- **Advanced Tiers**: Unlocks unlimited AI recipe suggestions, premium OCR scans, and extended family workspace limits.

### 6. Kitchen-First PWA Experience
- **Installable Native Feel**: Configured with `vite-plugin-pwa` for installation on iOS, Android, and desktop.
- **Countertop-Optimized UI**: Clean, high-contrast layouts crafted with Tailwind CSS and Radix UI primitives (bottom drawers via Vaul, carousels via Embla).

---

## Architectural Overview

À la carte is architected as an offline-capable, responsive Single Page Application (SPA) communicating with Supabase PostgreSQL and serverless Deno Edge Functions:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Frontend Client (React 18 + Vite)                │
│   Tailwind CSS  •  Radix UI (shadcn)  •  TanStack Query  •  Zod Forms   │
└───────────────▲───────────────────────────────────────▲────────────────┘
                │                                       │
                │ Supabase JS Client                    │ HTTP Edge Calls
                │ (PostgreSQL + Auth + Storage)         │ (Bearer JWT Auth)
                ▼                                       ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       Supabase Backend Service       │  │   Deno Edge Functions        │
│                                      │  │                              │
│ • PostgreSQL with RLS Policies       │  │ • suggest-recipe (Gemini AI) │
│ • public.is_shared_with_me()         │  │ • scan-recipe-image (Vision) │
│ • GoTrue Authentication              │  │ • scrape-recipe (Web Parser) │
│ • Supabase Storage (Recipe Photos)   │  │ • invite-family (Mailer)     │
└──────────────────────────────────────┘  │ • stripe-webhook (Stripe)    │
                                          └──────────────▲───────────────┘
                                                         │ External APIs
                                          ┌──────────────▼───────────────┐
                                          │ Google Gemini • Stripe API   │
                                          └──────────────────────────────┘
```

---

## Database Design & Security

Data security and multi-tenant separation are enforced at the database engine level using PostgreSQL Row-Level Security (RLS):

- **Private Group Boundary**: Tables `recipes`, `stock`, and `shopping_list` are tied to owners and validated through the PostgreSQL security function:
  ```sql
  public.is_shared_with_me(item_owner_id uuid)
  ```
- **Guaranteed Isolation**: No user can read, modify, or delete items belonging to another household unless explicitly linked within the `family_members` table.
- **Declarative Migrations**: Managed exclusively via the Supabase CLI (`supabase/migrations/`), ensuring reliable, reproducible schema evolution across environments.

---

## Tech Stack

| Layer | Technologies | Description |
|---|---|---|
| **Frontend** | React 18, Vite, TypeScript | Modern, high-performance SPA foundation |
| **Styling & UI** | Tailwind CSS, Radix UI, Lucide, Vaul | Accessible, mobile-first design system |
| **Data & State** | `@tanstack/react-query`, React Hook Form, Zod | Resilient server-state caching & type-safe validation |
| **Backend & DB** | Supabase (PostgreSQL 15+, GoTrue Auth) | Relational database with fine-grained RLS |
| **Edge Functions** | Deno, TypeScript | Low-latency serverless endpoints |
| **Artificial Intelligence** | Google Gemini API (1.5 / 2.0 Flash) | Generative recipe synthesis & multimodal OCR |
| **Payments** | Stripe API | Checkout sessions, billing portal, webhooks |
| **PWA** | `vite-plugin-pwa`, Service Workers | Offline support & home screen installability |

---

## Getting Started & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher) or [Bun](https://bun.sh/)
- A [Supabase](https://supabase.com/) project (with Auth, Database, and Storage enabled)
- (Optional) [Supabase CLI](https://supabase.com/docs/guides/cli) for local database migrations

### 1. Clone the Repository
```bash
git clone https://github.com/PLRpower/a-la-carte-app.git
cd a-la-carte-app
```

### 2. Install Dependencies
```bash
npm install
# or
bun install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Database Migrations
If using the Supabase CLI locally:
```bash
npx supabase db push
```

### 5. Launch the Development Server
```bash
npm run dev
# or
bun dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 6. Production Build
```bash
npm run build
```

---

## Engineering Challenges & Learnings

1. **Deterministic Group-Based Access without Overhead**:  
   Transitioning from traditional individual sharing toggles to a clean group-level RLS architecture required designing custom PL/pgSQL security functions (`is_shared_with_me`) capable of executing with negligible latency over thousands of rows.
2. **Robust Natural Language Ingredient Parsing**:  
   Users enter ingredients in varied human formats (*"3 ripe avocados"*, *"250g of whole wheat flour"*, *"a pinch of salt"*). Developing a resilient parser (`src/lib/ingredient-parser.ts`) to reliably separate quantities, units, and ingredient names without adding heavy external NLP dependencies was a key engineering achievement.
3. **Multimodal AI Integration in Kitchen Scenarios**:  
   Implementing OCR image scanning for physical recipe cards required fine-tuning prompts to handle challenging real-world inputs: varied handwriting, greasy paper stains, and uneven kitchen lighting.
4. **Snappy Mobile Performance**:  
   Heavy route transition animations were deliberately discarded in favor of lightweight, instant DOM updates, ensuring smooth 60fps performance on budget mobile devices while navigating in busy kitchen environments.

---

## Author & Credits

Developed with passion by **Paul THOMAS** ([@PLRpower](https://github.com/PLRpower)).

[![GitHub Profile](https://img.shields.io/badge/GitHub-PLRpower-181717?style=flat-square&logo=github)](https://github.com/PLRpower)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Paul_Thomas-0077B5?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/paul-thomas-dev/)

*Distributed under the MIT License. Contributions and feedback are warmly welcomed!*