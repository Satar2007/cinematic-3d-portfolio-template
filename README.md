# Cinematic 3D Portfolio Template

A customizable portfolio built with React, TypeScript, Vite, and React Three Fiber. Includes a cinematic intro, interactive 3D background, project case study, photo gallery, and responsive layouts.

**Free to copy, modify, and use for personal or commercial projects under the MIT License. Keep the license notice when redistributing the code.** Dependencies retain their own licenses.

## What's included

- Cinematic intro with skip, replay, and session memory.
- Interactive Three.js scene, pointer movement, card tilt, and magnetic buttons.
- Profile, project, toolkit, personal gallery, and contact sections.
- Full project case study with keyboard focus handling.
- Photo lightbox and gallery spotlight effect.
- Reduced-motion support and a motion toggle.
- WebGL error boundaries so decorative 3D can fail without removing the page.
- Vercel build configuration.

All identity text is example content. **Demo Coffee is a fictional case study**, including its metrics, features, contributions, and testing descriptions. Replace it with your actual experience before publishing. This is a frontend portfolio, not a working POS/payment application.

There are no personal photographs, API keys, deployment credentials, or links to the original owner's project in this template. All bundled image assets are original SVG placeholders included under the MIT License. The author attribution in LICENSE is intentionally retained.

## Quick start

Requirements: Node.js 22.12+ and npm.

Use GitHub's **Use this template** button when available, or clone the repository using its actual URL from the green Code button. Then open the cloned folder and run:

```sh
npm ci
npm run dev
```

Open the Local URL printed in the terminal. Do not open index.html directly.

## Make it yours

| File | What to change |
| --- | --- |
| `src/content.ts` | Brand, initials, name, location, education, bio, image paths, project URL, gallery titles and captions |
| `src/main.tsx` | Hero text, interests, skill lists, project title, all long case-study content and metrics |
| `src/style.css` | Colors, spacing, typography, animation and responsive styles |
| `public/photos/` | Add your own appropriately licensed images |
| `index.html` | Page title and description |
| `public/favicon.svg` | Your favicon |
| `public/site.webmanifest` | App name, short name, and theme |

The `profile.repository` setting starts empty. Repository buttons are hidden until you supply a real HTTPS URL; no broken example GitHub links are included.

Keep brand names and initials short to fit the header and intro. Update the gallery image alt text through its caption. Profile/about image alt text is also configurable in content.ts.

### Add photos

1. Place your own files inside `public/photos/`, for example `portrait.webp`.
2. Set `profile.portrait` to `/photos/portrait.webp` in `src/content.ts`.
3. Set `profile.aboutImage` and edit `galleryPhotos` entries. Gallery `src` values are filenames relative to `public/photos/`.
4. Update captions and alt text to describe the actual images.
5. Compress large files before committing. Never commit photos you do not intend to publish.

SVG placeholders contain text and geometric gradients. Replace them to create your final portfolio. No external photo service is required.

### Motion and accessibility

The OS reduced-motion preference disables intro playback by default. Visitors can toggle motion in the footer. The scene is decorative; all portfolio content remains ordinary HTML. The gallery works with pointer input and keyboard focus. Case study closes with Escape. Google Fonts has system-font fallbacks.

## Production build

```sh
npm run build
npm run preview
```

The preview script already includes a host flag; do not add another one. The Three.js vendor bundle can trigger Vite's size warning. That warning is not a failed build. Check the published site on your target mobile devices before sharing widely.

## Deploy to Vercel

Import your own repository, choose Vite, and use:

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm ci`

These build settings are included in `vercel.json`. No environment variables are needed.

Alternatively, run from this template's root:

```sh
npx vercel@latest login
npx vercel@latest --prod
```

Create a **new** Vercel project for your copy. This repository contains no `.vercel` folder or links to another deployment.

## Publishing this repository

Commit the source, `package-lock.json`, placeholders, README, and LICENSE. Do not commit `node_modules`, `dist`, `.vercel`, `.env`, ZIPs, or backup files; ignore rules are provided.

On GitHub, the repository owner can enable **Template repository** in repository Settings > General. Keep the repository public if you want anyone to browse and clone it.

## License

MIT — see [LICENSE](LICENSE). No paid assets or premium components are required. Third-party dependencies and Google Fonts remain subject to their respective licenses.
