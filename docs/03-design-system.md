# 03 Design System

## Direction
- Minimal
- Editorial
- Warm-neutral
- Whitespace-first
- Photography-forward

## Typography
- Body serif: `Source Serif 4` (or `Literata` fallback)
- UI sans: `Public Sans` (or `Work Sans` fallback)
- Line length target: `65-75ch`
- Base body size: `18px` desktop, `17px` mobile
- Generous line height: `1.65-1.8`

## Font Loading Strategy
- Self-host both font families using local `woff2` files
- Use `font-display: swap`
- Subset to used character ranges when possible
- Do not fetch fonts from Google CDN in production

## Color Tokens (Warm/Calm)
```css
:root {
  --bg: #f7f4ee;
  --surface: #fdfbf7;
  --text: #1f1d1a;
  --muted: #6f675d;
  --rule: #dbd2c6;
  --accent: #6b7a63;
  --accent-soft: #e8eee3;
}
```

## Layout Rules
- Single-column reading layout for long-form pages
- Max prose width with generous side breathing room
- Avoid sidebar clutter
- Minimal fixed chrome

## Components
- Header: simple brand + 4 links
- Hero statement: short and clear
- Content cards: subtle borders, no heavy shadows
- Tag chips: quiet styling
- Embeds: framed, consistent margins, responsive ratio
- Lightbox behavior:
  - keyboard support (left/right arrows, esc close)
  - close on backdrop click
  - focus trap while open (deferred)
  - swipe gesture support on touch devices (deferred)

## Motion
- Keep motion subtle and rare
- No parallax, no heavy transitions
- Prefer opacity/translate reveal only where needed

## Accessibility Baseline
- Semantic HTML landmarks and heading order
- Visible focus states
- Alt text required for content images
- Contrast target: WCAG AA

## Explicitly Out Of Scope (v1)
- Dark mode theme toggle
