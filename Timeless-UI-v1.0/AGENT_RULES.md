# TIMELESS UI — AGENT RULES

This is the source of truth for AI agents.

## Identity
Timeless is function-first, monochrome, flat, and brutalist-inspired.
Desired feeling: obvious, direct, calm, durable, editorial, honest, utilitarian.

## Two-tone rule
Light: background #FFFFFF, foreground #000000.
Dark: background #000000, foreground #FFFFFF.
Primary controls invert the canvas. Never introduce gray, colored accents,
gradients, blur, glow, tinted surfaces, or colored shadows.

## Theme
Dark mode is a true inversion, not a separate palette.

## Material
All surfaces are solid. Never use glassmorphism, neumorphism, translucency,
backdrop-filter, gradients, glossy effects, or decorative blobs.

## Shape
Default radius is 0px. Controls may use 2px.
Do not turn everything into pills.
Circles are reserved for avatars, indicators, and icon-only controls where useful.

## Hierarchy
Prefer, in order:
1. position
2. scale
3. typography weight
4. spacing
5. borders
6. inversion
7. icons

Use borders before shadows. Default border 1px; strong separation 2px.

## Typography
Primary: Inter, Helvetica Neue, Helvetica, Arial, sans-serif.
Monospace for code, IDs, timestamps, technical values, and aligned data.
Do not use decorative display fonts.

## Spacing
Use a 4px base: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64.

## Buttons
Primary = inverted solid button.
Secondary = canvas button with border.
Tertiary = text/underline.
Use explicit action labels such as Save, Add project, Export.

## Icons
Use one consistent outline icon family per project.
Preferred: Lucide or equivalent.
16px compact, 18px default, 20px action, 24px navigation.
No emoji/random SVG/mixed icon styles.

## Forms
Explicit labels, rectangular inputs, visible borders, clear focus, useful helper text.
Do not hide labels in placeholders.

## Tabs and filters
Tabs are not pills. Prefer text with active underline.
Filters must remain distinguishable from tabs.

## Cards
Use cards only when grouping is useful. Default: solid surface, 1px border,
no shadow, no decorative icon background.

## Data
Use strong headers, row separators, aligned numbers, and monospace where useful.
Do not make every row a floating card.

## Feedback
There are no semantic colors. Communicate status with words, icons, borders,
symbols, and typography: `ERROR — Payment failed`, not a red badge.

## Motion
Motion is functional:
feedback 120ms, normal 180ms, panels 240ms.
No bounce, elastic motion, parallax, decorative loops, or exaggerated scaling.
Respect `prefers-reduced-motion`.

## Responsive
Mobile is a composition change, not scaled desktop.
Minimum touch target 44px. Stack controls, reduce columns, keep primary actions
visible, and convert complex tables to key/value blocks when appropriate.

## Universal rule
Never create domain-specific styling rules. Define reusable patterns such as
metric, collection, status, navigation, form, table, timeline, feed, command bar,
and detail view.

## Anti-generic rule
Do not solve every screen as `rounded card + icon + title + subtitle + button`.
Let information architecture determine the composition.

## Acceptance test
A Timeless interface passes when:
1. Removing color still leaves hierarchy.
2. Removing shadows still leaves grouping.
3. Light/dark are exact black/white inversions.
4. Components are recognizable by function.
5. Typography and spacing do most visual work.
6. There is no unnecessary ornament.
7. Mobile is deliberately composed.
8. It feels durable rather than trend-dependent.
