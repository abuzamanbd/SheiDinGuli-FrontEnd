# গল্পকথা — Frontend (Next.js)

Bengali-only writing platform UI. Next.js 16 (App Router), React 19, TypeScript, SCSS.
Data is **sample data** (`src/lib/api/mock.ts`) until the backend endpoints exist.

## Run
```
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```
Preview pages: `/`, `/?layout=classic`, `/post/nodir-opare-ekta-lal-bari`, `/author/tanjila_r`, `/design`, `/design/theme-lab`, `/design/article-themes`.

## Rules
- CSS lives only in `src/styles/**` (SCSS). Components use class names only; no inline styles.
- Prefixes: `l-` layout, `c-` component, `s-` section, `p-` page, `is-*` state/kind. BEM `__` / `--`.
- Every colour, font and radius is a CSS variable defined in **one** place: `src/lib/theme/tokens.ts`.
  Add a token there and it appears in the (future) admin theme editor automatically.
- Every block renders `data-section="<unique.key>"` (e.g. `home.stories`, `layout.menu`).

## Where things are
| What | Where |
|---|---|
| Theme tokens, fonts | `src/lib/theme/tokens.ts` |
| Day-specific themes (Boishakh, Ekushey, Bijoy…) | `src/lib/theme/presets.ts` |
| Home sections / layouts | `src/components/sections/Home.tsx` |
| Article themes (classic, modern, poetry, nostalgia, night) | `src/styles/themes/article`, `src/lib/articleThemes.ts` |
| Data contract | `src/lib/api/types.ts` |
