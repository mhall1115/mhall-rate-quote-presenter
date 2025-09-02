# Deployment Guide (GitHub Pages)

This app is configured to deploy automatically to **GitHub Pages** from the `main` branch using GitHub Actions.

## Prerequisites
- Repo: `mhall1115/mhall-rate-quote-presenter`
- Workflow: `.github/workflows/deploy.yml` (already uploaded)
- Vite base path in `vite.config.ts`: `base: "/mhall-rate-quote-presenter/"` (already set)

## One-time Fix (already included in file below)
To avoid a blank page and unsafe key exposure, update `services/mortgageAPIs.ts` to use Vite env (`import.meta.env.VITE_API_KEY`) **and** provide safe fallbacks when no key is present. Replace your file with `mortgageAPIs.patched.ts` attached in this chat.

> ⚠️ **Do not put your AI key in GitHub Pages**. Any `VITE_*` value is baked into the client bundle and is public. Leave it unset for production unless you accept that risk or add a server/proxy later.

## Steps (Each Deployment)
1. **Replace the AI file (once):**
   - Copy the provided `mortgageAPIs.patched.ts` to your project:
     - `rate-quote-presenter/services/mortgageAPIs.ts` (overwrite existing)
   - Commit and push:
     ```bash
     git add services/mortgageAPIs.ts
     git commit -m "Use Vite env + safe fallbacks for AI; no client secrets"
     git push origin main
     ```

2. **GitHub Actions runs automatically**
   - Go to **Actions** tab → confirm a run started for commit on `main`.
   - Wait for steps: Checkout → Setup Node → Install → Build → Deploy.

3. **Confirm gh-pages updated**
   - In **Code** tab → switch branch to `gh-pages` → ensure files reflect **dist** build.

4. **Check your live site**
   - https://mhall1115.github.io/mhall-rate-quote-presenter/
   - Allow 1–5 minutes after deploy.

## Local development
- Keep `VITE_API_KEY` **only in local `.env.local`**, never commit:
  ```env
  VITE_API_KEY=your_key_here
  ```
- Run app locally:
  ```bash
  npm install
  npm run dev
  ```

## Adding a secure backend (optional, recommended later)
If you want live AI features in production without exposing your key:
- Add a small backend (Cloudflare Workers / Netlify Functions / Vercel) to hold the secret and proxy requests.
- The frontend calls your backend, not Google directly.

