# Aligned Insights Website

Product-led website foundation for `alignedinsights.tech`.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Vercel deployment target
- Supabase-ready integration layer

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy `.env.example` into a local `.env.local` and provide the existing Supabase project values.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

The Supabase helpers use lazy initialization so builds remain compatible with Vercel even before environment values are present. `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed with a `NEXT_PUBLIC_` prefix.

Create a private Financial Insights intake link locally with:

```bash
npm run intake:create-link -- contact@example.com "Organization Name" 2026-06-30
```

Admin review screens should be added behind authentication before listing submitted intakes in the app.

## Structure

```text
src/app
  App Router routes and global styles
src/components
  Brand, layout, and visual interface components
src/lib/supabase
  Supabase configuration and client factories
```

## Checks

```bash
npm run lint
npm run build
npx vercel build
```
