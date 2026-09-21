# Wedding Mobile Invitation

## Project Overview

This is a custom Korean mobile wedding invitation website.

The goal is NOT to create a conventional wedding invitation template.

The website should feel like:

- Editorial
- Luxury Minimal
- Cinematic
- Premium
- Timeless
- Interactive Storytelling

The core concept is:

> A mobile storytelling website that tells the story of two people,
> with wedding information naturally appearing throughout the experience.

It should feel closer to a premium editorial / exhibition / brand website
than a conventional wedding invitation.

---

# 1. Source of Truth

The project currently has:

- `docs/prompt.md`
- `mockup/index.html`

## Design Source of Truth

`mockup/index.html` is the current approved visual reference.

When migrating or implementing the website:

- Do NOT redesign the existing mockup.
- Do NOT improve the design unless explicitly requested.
- Do NOT replace the visual direction with a generic wedding template.
- Do NOT introduce unnecessary UI patterns.
- Preserve the current layout, typography, spacing, colors, interactions, and responsive behavior.

When there is uncertainty about how something should look:

1. Check `mockup/index.html`
2. Check `docs/prompt.md`
3. Preserve the existing design rather than inventing a new one

The mockup should remain unchanged as a reference during migration.

---

# 2. Design Principles

The visual language should remain:

- Editorial
- Luxury minimal
- Typography-focused
- Photography-focused
- Generous whitespace
- Restrained animation
- Strong hierarchy
- Cinematic but not flashy

Avoid:

- Generic wedding invitation templates
- Floral wedding graphics
- Ribbons
- Excessive gold decoration
- Excessive beige decoration
- Wedding illustrations
- Heavy gradients
- Excessive rounded cards
- Excessive shadows
- Generic dashboard-style UI
- Overly decorative UI

The website should not visually communicate:
"this is a typical wedding invitation template."

It should communicate:
"this is a carefully designed story about two people."

---

# 3. Current Information Architecture

The current website contains sections for:

- Opening
- Our Story
- Invitation
- Wedding
- Venue
- Gallery
- Account
- Guestbook
- Photo Share / Footer

The exact section IDs and order should follow `mockup/index.html`.

Do not reorder sections unless explicitly requested.

---

# 4. Our Story

The Our Story section is a major visual feature.

It currently uses a vertical scroll interaction to control
a horizontal storytelling timeline.

The concept includes:

- Birth years
- Growth
- Major life events
- First meeting
- Relationship
- Marriage

The current implementation includes:

- Sticky storytelling section
- Horizontal track
- Scroll progress
- Event items
- Active event
- Current year
- Ghost year
- Progress indicator
- SVG visual paths
- 2020 merge point

Preserve the current interaction.

Do not replace it with a generic carousel.

Do not change it to a normal horizontal slider unless explicitly requested.

---

# 5. Invitation Section

The Invitation section should communicate the background and growth
of the two people rather than only displaying wedding information.

The current approved concept includes:

- Groom's parents photo
- Groom's family/lineage description
- Groom's short growth story
- Groom's name
- Bride's parents photo
- Bride's family/lineage description
- Bride's short growth story
- Bride's name

The intended narrative is:

> Parents / family
> → childhood and growth
> → who they became
> → the person they are today

Parent photos are editorial portrait elements,
not small decorative thumbnails.

Do not turn this into a conventional family-photo card layout.

---

# 6. Navigation

The website has a fixed navigation.

It should remain practical rather than decorative.

The navigation includes:

- Brand / initials
- Menu button
- Fullscreen menu
- Section navigation
- Active section indication
- Light/dark theme adaptation

The fullscreen menu should retain:

- Scroll lock
- ESC close
- Accessibility attributes
- Section links
- Existing animation

Do not remove the fixed navigation simply because the website is highly visual.

It exists so guests can quickly access practical information.

---

# 7. Responsive Design

This is primarily a mobile wedding invitation.

Mobile is the primary design target.

Always test approximately:

- 375px
- 390px
- 412px
- 430px

Desktop should also remain usable.

When making responsive changes:

- Preserve the visual hierarchy.
- Do not simply scale desktop down.
- Keep typography readable.
- Preserve whitespace.
- Prevent horizontal overflow except where horizontal storytelling is intentional.

---

# 8. Technology Stack

The target stack is:

- Next.js
- TypeScript
- App Router
- pnpm
- Tailwind CSS
- shadcn/ui when useful

Do not introduce additional libraries without a reason.

Avoid adding dependencies for functionality that can reasonably be implemented
with the existing stack.

---

# 9. Component Architecture

Do not put the entire website in `app/page.tsx`.

Prefer a structure similar to:

```text
app/
├─ layout.tsx
├─ page.tsx
└─ globals.css

components/
├─ navigation/
│  └─ FixedNav.tsx
│
├─ sections/
│  ├─ Opening.tsx
│  ├─ Story.tsx
│  ├─ Invitation.tsx
│  ├─ Wedding.tsx
│  ├─ Venue.tsx
│  ├─ Gallery.tsx
│  ├─ Account.tsx
│  ├─ Guestbook.tsx
│  └─ PhotoShare.tsx
│
└─ ...

data/
├─ story.ts
├─ invitation.ts
├─ gallery.ts
└─ wedding.ts
