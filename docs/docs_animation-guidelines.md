# Animation Guidelines
## Shop Visibility Board (SVB)

Animations are used to **communicate change**, not decorate.

---

## Principles

- Subtle
- Purpose-driven
- Non-blocking
- Never distracting on a TV

---

## Allowed Animations

### Progress Updates
- Smooth width transition on progress bar
- Duration: 300–500ms
- CSS transition preferred

### Row Updates
- Soft background highlight on update
- Fade out after 1–2 seconds

### New Jobs
- Gentle fade-in
- No slide-in or bounce effects

---

## Prohibited Animations

- Infinite animations
- Pulsing elements
- Attention-grabbing motion
- Spinners on TV view

---

## Implementation Rules

- Prefer CSS transitions for simple effects.
- Use `framer-motion` for non-scroll UI animations when coordinating enter/exit states or when animation logic is complex.
- Use `gsap` only for scroll-linked animations (e.g., scroll-triggered reveals) and keep timelines minimal; avoid scroll hijacking.
- Do not mix `framer-motion` and `gsap` for the same effect; pick one per interaction.
- Never block render for animation.

---

## Admin UI

- Animations allowed but minimal
- Feedback-focused (save success, errors)
- TV rules always stricter than admin rules
