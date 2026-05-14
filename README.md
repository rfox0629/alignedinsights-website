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
ADMIN_PORTAL_PASSWORD=
RESEND_API_KEY=
ALIGNED_INSIGHTS_NOTIFY_EMAIL=ryan@alignedinsights.tech
RESEND_FROM_EMAIL=Aligned Insights <reports@alignedinsights.tech>
```

The Supabase, admin, and Resend helpers use lazy initialization so builds remain compatible with Vercel even before environment values are present. `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PORTAL_PASSWORD`, and `RESEND_API_KEY` are server-only and must never be exposed with a `NEXT_PUBLIC_` prefix.

Create a private Financial Insights intake link locally with:

```bash
npm run intake:create-link -- contact@example.com "Organization Name" 2026-06-30
```

The script automatically connects the link to the latest matching inquiry by email when possible. You can also pass an inquiry ID as the final argument.

The lightweight admin portal is available at `/admin` and `/admin/inquiries` after setting `ADMIN_PORTAL_PASSWORD`.

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
