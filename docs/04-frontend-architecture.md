# Frontend architecture

## Theming
Tokens (`lib/theme/tokens.ts`) → `buildThemeCss()` → `<style>:root{…}</style>` injected by `app/layout.tsx`. SCSS reads `var(--…)` only.
`resolveTheme(presets, defaultId, now)` picks a scheduled preset (recurring MM-DD or date range) else the default; presets store only differing tokens. Values are validated by `isSafeValue` before injection.

## Sections
`SectionConfig {key, enabled, title, subtitle, link, source, count, body, buttonLabel}`.
`source`: latest | top(metric, period) | category | postType | manual(postIds).
Home keys: home.ad.top, home.hero.latest, home.hero.slider, home.hero.top, home.categories, home.stories, home.poems, home.memories, home.sidebar.cta, home.sidebar.topics, home.sidebar.ad, home.authors, home.newsletter.
Layout keys: layout.topbar, layout.header, layout.menu, layout.footer. Post: post.article, post.authorbox, post.prevnext, post.comments, post.related. Author: author.page/cover/head/side/posts.
`homeLayout`: `magazine` (design B, default) or `classic` (design A), same components with variants.

## Ads
`AdSlot` slots: home.ad.top, home.sidebar.ad, post.top, post.inarticle (after paragraph 3), post.bottom, author.top, author.side, author.between. Placeholders show when `NEXT_PUBLIC_SHOW_AD_PLACEHOLDERS=true`.

## Mock → real API
`lib/api/index.ts` exports `api = mockApi`. Implement `SiteApi` in `api/http.ts` and switch on `NEXT_PUBLIC_USE_MOCK`.

## Backend still needed
- Site settings: name, tagline, **logo upload**, homeLayout, top bar, footer, defaultThemeId.
- Theme presets CRUD (tokens + schedule); section configs CRUD; menu CRUD.
- Public read endpoints: posts by source, post by slug (sanitised HTML + articleTheme), author, topics.
- Likes / views counters and top-posts (by period).
- Author picks `articleTheme` per post.
- Auth endpoints wired to the login/register modal (currently sample only).

## Not built yet
Category/topic/page routes linked from menus (they 404), search, comments, admin UI (the Theme Lab is a prototype).
