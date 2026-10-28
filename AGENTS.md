# AGENTS.md

## Project

ERP frontend. React 19 + Vite 7 + React Router + i18next + Recharts.
Auth and data through Supabase. Deployed on Vercel.

## Commands (run before finishing any task)

- `npm run lint`: must pass with zero errors
- `npm test`: must pass
- `npm run build`: must pass

## Folder structure (src/)

- `pages/`: one file per screen/route. Pages compose components.
- `components/`: reusable UI. Components must not import from `pages/`.
- `layouts/`: page shells (sidebar, header, auth layout).
- `routers/`: route definitions only.
- `context/` and `hooks/`: shared state and reusable logic.
- `services/`: all calls to Supabase / the API.
- `utils/`: pure helper functions (no UI, no network).
- `locales/`: translation files.
- `theme/`: design tokens (colors, spacing, typography).

## Architecture rules

- No Supabase or API calls inside components or pages. Go through `services/`.
- Reuse an existing component before creating a new one.
  If a new one is needed, explain why in the PR.
- New logic with no UI goes in `utils/` and must have a test.

## Design rules

- No hardcoded colors, font sizes or spacing. Use `theme/`.
- Mobile first. Every screen must work on small screens.
- Every interactive element needs a visible label and keyboard access.

## i18n rules

- No hardcoded user-facing text. Use `t('key')`.
- Add every new key to ALL files in `locales/`.

## Security rules

- Never put secrets or the Supabase `service_role` key in frontend code.
  Only `VITE_`-prefixed public variables are allowed.
- Never commit `.env`. Update `.env.example` when adding a variable.
- Never render user input as raw HTML (`dangerouslySetInnerHTML` is forbidden).
- Do not add a dependency without asking a human first.

## Needs human approval (do not change alone)

- `.github/workflows/*`, `vercel.json`, `server.mjs`
- Dependencies in `package.json`
- Authentication logic

## Workflow

- One task = one branch (`feat/...`, `fix/...`, `docs/...`) = one small PR.
- Never push to `main`. CI must be green before merge.
- PR description: what changed, which files, and a before/after screenshot for UI changes.
