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
```

The Supabase helpers use lazy initialization so builds remain compatible with Vercel even before environment values are present.

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
