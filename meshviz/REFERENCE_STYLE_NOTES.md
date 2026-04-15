# Reference Style Notes

## Intent

This tool should feel like a minimal technical illustration instrument, not a glossy product demo and not a CAD workstation.

## Visual Rules

- background should be white or very light neutral gray
- linework should be black or charcoal
- composition should feel exact, sparse, and diagram-first
- the viewport should dominate the layout
- controls should be minimal and visually subordinate
- no gradients
- no glassmorphism
- no glossy panels
- no cozy textures
- no oversized rounded cards
- no decorative illustration unrelated to the model

## UI Behavior Rules

- framing mode should feel distinct from diagram mode
- controls should be few and obvious
- empty state should be calm and useful
- error states should be short and inline
- avoid adding exploratory UI that implies CAD features

## Rendering Rules

- preview mode can show simple solid shading only to confirm geometry
- final diagram mode should prioritize lines over surfaces
- future architecture should support explicit edge geometry and SVG export
- do not use screen-space stylization as the core rendering strategy

## Anti-Patterns

Avoid:
- startup / SaaS dashboard styling
- dark glossy 3D viewer aesthetics
- feature creep into file management or scene editing
- excessive control density
- ornamental UI chrome