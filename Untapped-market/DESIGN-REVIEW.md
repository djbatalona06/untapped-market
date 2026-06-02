# Untapped Market — Design System Overhaul Review

## Change Summary

The Untapped Market website underwent a complete visual transformation from a generic dark-mode UI with cold blacks and overly saturated accents to a **PNW Forest** aesthetic rooted in the Organic Biophilic and Nature Distilled design philosophies. The redesign touches every visual layer: typography shifted from the geometric `Outfit` and decorative `DM Serif Display` to the warmer, more organic pairing of **Lora** (serif headings) and **Raleway** (sans-serif body text) — a combination specifically recommended for wellness and cannabis brands. The color palette moved away from pure blacks (`#09080a`) toward forest-tinted darks (`#0B100A` with green undertones), replacing harsh amber accents with warm honey tones and introducing PNW moss teal as a secondary color.

At the component level, elements were softened to avoid the machine-perfect aesthetic that makes interfaces feel artificial. Pillar cards now use organic, asymmetric border-radius values (`14px 18px 14px 16px`) and carry subtle dual-radial-gradient texture overlays. Strain indicator dots shed their perfect circles for organic blob shapes with natural highlight gradients. Emoji icons throughout the pillar cards were replaced with purpose-built inline SVGs (DNA leaf, evergreen tree, lab flask, map pin) that align with the nature-first visual language. Buttons gained tactile depth through soft box-shadows and press-feedback transforms, while harsh hover effects were toned down to gentler 200ms ease-out transitions.

The hero section now features a forest-green gradient backdrop with commented-out placeholders for an authentic PNW landscape photograph, complete with overlay instructions to maintain text readability. Hero ambient animations — smoke wisps, trichome particles, glow pulses — were all recalibrated to use the new palette at reduced intensities, creating an atmosphere that feels organic rather than digital. Even the Leaflet map theme and JavaScript-rendered map popups were updated to maintain palette consistency throughout the entire experience.

---

## Manual Review Checklist

### Visual — Color & Typography
- [ ] Open the file in Chrome, Firefox, and Edge — verify fonts load correctly
- [ ] Lora italic renders properly in hero headings, section titles, and strain names
- [ ] Raleway renders at 400 weight for body text and 600+ for buttons/labels
- [ ] DM Mono still displays correctly for stats/data elements (THC %, CBD %, etc.)
- [ ] Background colors have a visible green undertone, not pure black
- [ ] `--accent` green (`#5E9B4D`) is clearly distinguishable from `--teal` (`#4D8B7A`)
- [ ] Amber/gold tones (`#C49540`) feel warm, not orange or harsh
- [ ] Text contrast: primary text on dark backgrounds meets 4.5:1 WCAG AA ratio
- [ ] Secondary text (`--text2`) is readable but visually subordinate to primary

### Components — Shapes & Textures
- [ ] Pillar cards show asymmetric rounded corners (not perfectly uniform)
- [ ] Pillar card background texture is barely visible — felt, not seen
- [ ] Strain cards have a faint grain overlay (should be nearly imperceptible)
- [ ] Strain dots are organic blob shapes, not perfect circles
- [ ] Strain dot highlight gradient gives a subtle 3D/natural feel
- [ ] Buttons have soft shadow depth (`.btn-primary`) on light backgrounds
- [ ] Button `:active` press state feels responsive (slight scale-down)
- [ ] Card hover states lift subtly (2px) with muted green border glow
- [ ] Badge colors (indica purple, sativa green, hybrid gold) remain distinct

### Assets — Placeholder Verification
- [ ] Hero section contains commented-out `background-image` instructions (around line 140)
- [ ] Pillar icons are inline SVGs with `{/* Custom SVG: ... */}` labels
- [ ] SVG icons use `var(--accent)` for strokes/fills (theme-consistent)
- [ ] SVGs include `aria-hidden="true"` for accessibility

### Content — Tone & Language
- [ ] `<!-- TONE REVIEW -->` comments are present near hero, pillars, and spotlight
- [ ] Hero subtitle reads as inviting, not salesy
- [ ] Pillar descriptions feel knowledgeable but approachable
- [ ] Strain descriptions evoke place and experience, not just chemical data
- [ ] No corporate jargon ("leverage", "optimize", "disrupt") — use human words

### Technical — Browser & Responsive
- [ ] No horizontal scroll at any breakpoint
- [ ] 375px (mobile): hero pillars stack to 2-column grid
- [ ] 768px (tablet): catalog sidebar collapses, detail hero stacks
- [ ] 1024px+: full layout renders correctly
- [ ] 1440px: content stays within max-width container
- [ ] Leaflet map popups render with correct forest-themed colors
- [ ] Map markers use new green/amber colors
- [ ] `prefers-reduced-motion` disables all hero ambient animations

### Accessibility
- [ ] Color contrast ratio ≥ 4.5:1 for body text (use Chrome DevTools audit)
- [ ] All interactive elements have visible focus states
- [ ] SVG icons have `aria-hidden="true"` (decorative, not informational)
- [ ] Strain type badges don't rely on color alone (text label present)
- [ ] Form inputs have visible labels (not placeholder-only)
- [ ] Touch targets ≥ 44px on mobile

---

## Future Recommendations

### Priority 1 — High Impact, Low Effort
1. **Commission custom SVG icon set**: Replace the placeholder SVGs with a cohesive set of hand-drawn or organic-line icons (terpene wheel, leaf silhouettes, mountain range, raindrop). Consider Figma community resources or a freelance illustrator familiar with PNW aesthetics.
2. **Add authentic PNW photography**: Source 3–5 high-quality images (misty Cascades, old-growth forest canopy, Puget Sound shoreline, close-up cannabis trichomes). Use the hero placeholder comment as a starting point. Services like Unsplash or locally-shot photography work well.
3. **Implement light mode variant**: Define a `:root[data-theme="light"]` override using the Nature Distilled light palette (Soft Cream `#F5F0E1`, Terracotta `#C67B5C`, Sand Beige `#D4C4A8`). Add a toggle in the nav.

### Priority 2 — Medium Effort, Strong Polish
4. **Refine animations with spring physics**: Replace linear easing in card hovers and page transitions with spring-based curves (`cubic-bezier(0.34, 1.56, 0.64, 1)`) for a more natural, living feel.
5. **Add micro-interactions**: Subtle leaf-fall particle effect on bookmark actions; gentle ripple on button press; terpene wheel animation on strain detail pages.
6. **Extract CSS to external stylesheet**: Move the `<style>` block to `styles/untapped-market.css` and organize with CSS custom property sections, component blocks, and utility classes. This enables caching and easier maintenance.

### Priority 3 — Scalability & Validation
7. **Migrate to Vite + React SPA**: The current single-file React setup via Babel standalone is not production-ready. Migrate to the Vite/React/Supabase scaffold (already planned in Phase 1–3 per project memory). Port the CSS variables into a proper design token system.
8. **Consider Tailwind CSS**: For the component library, Tailwind with custom theme configuration would map cleanly to the design tokens. Use `@apply` for complex components and utility classes for layout.
9. **User testing**: Recruit 5–8 PNW cannabis consumers for moderated usability sessions. Focus areas:
   - Does the design feel "local" and trustworthy?
   - Can users find strain information intuitively?
   - Does the aesthetic match expectations for a cannabis discovery tool?
   - Do organic textures enhance or distract from content?

### Priority 4 — Content & Brand
10. **Develop a content style guide**: Define voice and tone rules (first-person plural "we", Pacific Northwest vocabulary, avoid clinical/corporate language). Include example rewrites of existing copy.
11. **Add seasonal design touches**: Subtle CSS variable overrides for PNW seasons — autumn terracotta accents, winter muted blues, spring fresh greens. Triggered by date or manual toggle.
12. **Integrate real photography into strain cards**: Replace placeholder thumbnails with actual product photography or stylized botanical illustrations.

---

*Generated: 2026-05-25 | Design System: PNW Forest (Organic Biophilic + Nature Distilled)*
*Typography: Lora + Raleway | Primary Accent: #5E9B4D | Tool: UI/UX Pro Max v2.5.0*
