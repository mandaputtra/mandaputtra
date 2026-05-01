# Design System (Starter)

This document summarizes the current website design primitives (colors, typography, radius, shadows) and provides starter tokens you can reuse.

## Sources

- Extracted URL: http://localhost:8081
- Main styling implementation:
  - [_sass/_variables.scss](file:///Users/fandi/Code/mandaputtra/_sass/_variables.scss)
  - [_sass/_base.scss](file:///Users/fandi/Code/mandaputtra/_sass/_base.scss)
  - [_sass/home.scss](file:///Users/fandi/Code/mandaputtra/_sass/home.scss)

## Visual Principles

- Soft contrast with a pastel background.
- Strong outline (dark-blue) to get the “cartoon outline” feel.
- Offset shadow (no blur) for a “card / sticker” effect.
- Hover: slight lift (translate) + stronger shadow.

## Tokens

- JSON: [design-system/tokens.json](file:///Users/fandi/Code/mandaputtra/design-system/tokens.json)
- CSS variables: [design-system/tokens.css](file:///Users/fandi/Code/mandaputtra/design-system/tokens.css)

## Colors

- Background:
  - Base: `#f4eeff`
  - Muted: `#dcd6f7`
- Text:
  - Base: `#312c51`
  - Muted / outline: `#424874`
- Brand:
  - Primary: `#a6b1e1`
  - Secondary: `#424874`
- Accent:
  - Yellow: `#fecd1a`
  - Pink: `#ffacb7`

## Typography

- Heading: Crimson Pro
- Body: Work Sans
- Base font size: 18px
- Line height:
  - Body: 1.7
  - Heading: 1.2

## Radius

- Small: 8px
- Medium: 15px
- Round: 9999px

## Shadows

- Small: `0.35rem 0.35rem 0 #424874`
- Medium: `0.45rem 0.45rem 0 #424874`

## Component Patterns (Existing)

- “Cartoon” button/badge
  - Strong outline + offset shadow
  - Hover lift: translate(-2px, -2px)
- Card (example: slides list)
  - Muted background + outline + shadow
  - Text hierarchy: title → meta → description
