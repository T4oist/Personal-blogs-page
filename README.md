# T4oist Blog

Personal blog built with Astro, Vue, Tailwind CSS, and TypeScript.

## Common Commands

```powershell
npm run dev
npm run build
npm run preview
npm run deploy
```

## Content

Blog posts live in `src/content/blog/`.

For the full writing, preview, GitHub upload, and Retinbox deployment flow, see:

[BLOG_PUBLISHING_GUIDE.md](./BLOG_PUBLISHING_GUIDE.md)

## Visual design and interaction

A continuous red-and-black portfolio inspired by the graphic direction of [Antoine Wodniack](https://wodniack.dev/): large condensed typography, ruled sections and a perspective grid. The homepage leads through about, projects, writing, moments and contact. Project and profile pages share the same visual language; articles use a quieter paper palette.

- Pointer-responsive, slowly rotating Canvas wireframe; oversized scrolling type; navigation letter scrambling; floating work previews; magnetic contact arrow and section reveals.
- The header motion control persists across navigation. System reduced-motion settings take priority. Canvas animation stops offscreen, in background tabs, and on page navigation; device pixel ratio is capped at 2.
- Work links also reveal their previews on keyboard focus. Hover decoration is optional on touch devices. Native scrolling and normal link navigation remain intact.
- Ctrl/Cmd + K searches published article content, projects and pages. Arrow keys and Enter open results; Escape closes and restores focus.
- Article categories/tags, full-text filtering, ordering and project platform filters remain shareable through the URL.
- An interest index, milestones, social links and email copying remain on the profile. Articles retain their routes, comments, adjacent-post links, mobile contents, active headings, reading progress and larger text.

Content comes from src/content/blog, src/content/projects and src/content/moments. Contact and Giscus settings remain in src/config.ts. Theme and motion preferences use the theme and motion local-storage keys.

Anton is self-hosted from the Google Fonts project under the SIL Open Font License; its license is included at public/fonts/OFL.txt. Effects are independently implemented with native browser APIs and existing dependencies.

- The contact letter offers three conversation topics, an editable subject and message, and an Open email link that prepares a mailto draft in the visitor’s email app. Switching topics preserves the message. Nothing is sent from the website; social links and email copying remain available.

## Validation

```powershell
$env:ASTRO_TELEMETRY_DISABLED='1'
npm run build
node scripts/check-site.mjs
npm run preview -- --host 127.0.0.1 --port 4323
```

The static check covers every generated local link, asset and fragment, duplicate IDs, homepage sections, motion controls, archive consistency, project coverage and comment containers. Browser checks cover desktop and mobile layout, pointer interaction, keyboard work previews, motion pause, search dismissal and focus restoration, filtering/sorting, interest display, theme changes and reading controls. The page remains readable without animation or JavaScript; search and filtering require JavaScript.

The current search embeds published content in each page. For a substantially larger archive, move it into a separately fetched index.
