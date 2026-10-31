# Lorenzo Trogu — Portfolio

Bilingual Italian/English personal portfolio built with React, TypeScript, Tailwind CSS v4, CSS animations and Vite.

## Development

`npm install`

`npm run dev`

## Production

`npm run build`

`npm run preview`

## GitHub Pages

Target repository: `lollotrogu/lollotrogu.github.io`.

The workflow in `.github/workflows/deploy-pages.yml` builds the site with Node.js 24 and deploys `dist` when `main` is updated. In repository Settings → Pages, select GitHub Actions as the publishing source. This is a user-site deployment at the domain root, so Vite's default `/` base is retained. Development helpers, local files, dependencies, and Sites metadata are excluded from Git.

The language switch persists locally. The portfolio presents a working student, with a timeline from secondary school to the current MSc and role at Blend Studio. All contact links work without a backend. Blue bubble animations and larger body text are used throughout.

The swimmer is a procedural articulated 3D model rendered with perspective projection on Canvas, with freestyle arm motion, flutter kick, body roll and a skeletal graph. Drag to rotate; controls pause motion, toggle the skeleton and reset the camera. The motion is illustrative, not an actual analysis output. Reduced-motion preferences are respected.

Projects: AiSwimmingAnalyzer, Blend Studio website and internal platform, a furniture retail CRM (quotes, pipeline, orders, Brevo, Meta leads and WhatsApp automation), AriaAi (Stripe payments and internal management platform), and ABC Tool. The Harley-Davidson project is excluded.

Profile photo supplied by Lorenzo; Blend logo supplied by URL. Technology logos are saved locally from Simple Icons. Brand names and logos belong to their respective owners.

Additional technology logos use Devicon (C, C#, Java and .NET Core); SQL uses a generic database glyph. TypeScript remains included once. Two bilingual full-screen dividers add fluorescent orbital lights, animated beams, particles and scroll-linked parallax. Intersection observers pause offscreen animations; mobile uses fewer effects, and reduced-motion preferences show a static composition.

Mobile: the introductory CTA targets `#about` to preserve reading order. Responsive JPEG portraits (480/800/1200 px) replace the original PNG in the public build. Touch controls are at least 44 px high. The swimmer uses a capped pixel ratio and 30 fps on small screens, skips drawing while offscreen or in a hidden tab, and redraws paused/reduced-motion frames only when the view changes. Mobile navigation closes with Escape or a selected link.

Content sources: supplied CV, local AiSwimmingAnalyzer README, and project descriptions provided by Lorenzo. LinkedIn profile URL comes from the CV; LinkedIn content could not be retrieved.

