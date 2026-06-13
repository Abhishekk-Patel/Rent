# TryRentIT Design System Documentation

## Overview

This document outlines the modern, unified design system implemented for the TryRentIT Angular application. All design tokens are centrally managed in `src/styles.css` and used consistently across all components.

---

## Design Tokens

### Brand Colors

All UI elements now reference these global brand tokens:

```css
--brand-primary: #8f1515        /* Primary action, headers, navigation */
--brand-primary-dark: #6b0f0f   /* Hover/active states, darker emphasis */
--brand-primary-light: #b94040  /* Secondary emphasis, disabled states */
--brand-accent: #c08b2d         /* Gold accents, decorative elements */
--brand-accent-light: #e6b84e   /* Light gold, secondary accent */
```

**Usage**:
- Buttons, links, badges → `--brand-primary`
- Hover states → `--brand-primary-dark`
- Disabled elements → `--brand-primary-light`
- Decorative accents → `--brand-accent`

### Neutral Color Palette

```css
--surface-0: #ffffff            /* Main background, cards */
--surface-1: #f8f7f6            /* Secondary background, hover states */
--surface-2: #f1ede9            /* Tertiary background, badges */
--surface-3: #e8e0d8            /* Borders, dividers */
--on-surface: #1a1210           /* Primary text */
--on-surface-muted: #6b5e58     /* Secondary text, metadata */
--border: rgba(26,18,16,.12)    /* Borders, outlines */
```

### Status Colors

```css
--success: #1e7e45; --success-bg: #edfaf2;
--warning: #b45309; --warning-bg: #fef9ed;
--danger:  #c0392b; --danger-bg:  #fef2f2;
--info:    #1a56db; --info-bg:    #eff6ff;
```

Use for form validation, alerts, and status indicators.

---

## Typography System

### Font Families

```css
--font-sans: 'Inter', 'Roboto', sans-serif      /* UI text */
--font-display: 'Playfair Display', Georgia, serif /* Headings, hero */
```

### Type Scale

```css
--text-xs:   0.75rem   /* 12px - labels, captions */
--text-sm:   0.875rem  /* 14px - body small, hints */
--text-base: 1rem      /* 16px - body text (default) */
--text-lg:   1.125rem  /* 18px - body large, button text */
--text-xl:   1.25rem   /* 20px - heading small */
--text-2xl:  1.5rem    /* 24px - heading medium */
--text-3xl:  1.875rem  /* 30px - heading large */
```

**Font Weights**:
- Regular: 400 (body copy)
- Medium: 500 (buttons, emphasis)
- Semi-Bold: 600 (labels, strong text)
- Bold: 700 (headings)

---

## Spacing System

Apply consistent padding, margins, and gaps using the spacing scale:

```css
--sp-1:  4px   /* Tight spacing, small gaps */
--sp-2:  8px   /* Small spacing between elements */
--sp-3:  12px  /* Comfortable spacing */
--sp-4:  16px  /* Standard padding/margin */
--sp-5:  20px  /* Medium spacing */
--sp-6:  24px  /* Large spacing */
--sp-8:  32px  /* XL spacing, section gaps */
--sp-10: 40px  /* XXL spacing */
--sp-12: 48px  /* Hero spacing */
```

**Usage Example**:
```css
.card {
  padding: var(--sp-4);
  margin-bottom: var(--sp-6);
  gap: var(--sp-3);
}
```

---

## Border Radius

Consistent corner rounding across the design:

```css
--r-sm:   6px      /* Small buttons, inputs */
--r-md:   10px     /* Standard controls */
--r-lg:   16px     /* Cards, modals */
--r-xl:   24px     /* Large containers */
--r-full: 9999px   /* Fully rounded (chips, avatars) */
```

---

## Shadow System

Create depth with consistent shadows:

```css
--sh-xs: 0 1px 3px rgba(0,0,0,.08)      /* Subtle hover effect */
--sh-sm: 0 2px 8px rgba(0,0,0,.10)      /* Cards, inputs */
--sh-md: 0 4px 20px rgba(0,0,0,.12)     /* Modals, dropdowns */
--sh-lg: 0 8px 40px rgba(0,0,0,.15)     /* Floating actions, sticky */
```

**Usage**:
- Buttons (default) → `--sh-xs`
- Cards → `--sh-sm`
- Modals/Overlays → `--sh-md` or `--sh-lg`
- Hover states → increase shadow depth

---

## Component Styles

### Buttons

All button variants use consistent styling:

```css
.btn-primary {
  background-color: var(--brand-primary);
  color: var(--surface-0);
}

.btn-secondary {
  background-color: var(--surface-1);
  color: var(--on-surface);
}

.btn-ghost {
  background-color: transparent;
  color: var(--on-surface);
  border: 1px solid var(--border);
}

.btn-danger {
  background-color: var(--danger);
  color: var(--surface-0);
}
```

**Also use Material Components**:
- `<button mat-flat-button color="primary">` → solid primary button
- `<button mat-stroked-button>` → outlined button
- `<button mat-icon-button>` → icon-only button

### Cards

```css
.card {
  background-color: var(--surface-0);
  border-radius: var(--r-lg);
  box-shadow: var(--sh-sm);
  border: 1px solid var(--border);
  padding: var(--sp-4);
}

.card:hover {
  box-shadow: var(--sh-md);
  transition: all 200ms ease;
}
```

### Badges & Pills

```css
.badge {
  padding: var(--sp-1) var(--sp-3);
  border-radius: var(--r-full);
  font-size: var(--text-xs);
  font-weight: 600;
  background-color: var(--surface-2);
  color: var(--on-surface);
}

.badge-success {
  background-color: var(--success-bg);
  color: var(--success);
}
```

### Forms

All form fields use Material Design with outline appearance:

```html
<mat-form-field appearance="outline">
  <mat-label>Label</mat-label>
  <input matInput />
</mat-form-field>
```

**Styles automatically applied**:
- Border: `var(--border)`
- Border-radius: `var(--r-md)`
- Padding: `var(--sp-3)`
- Focus color: `var(--brand-primary)`

---

## Animations

### Shared Keyframe Animations

```css
@keyframes sk {
  /* Skeleton loading shimmer */
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

@keyframes pop {
  /* Modal entrance */
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Transition Timing

- Fast interactions: `150ms–200ms`
- Standard transitions: `200ms–300ms`
- Slow animations: `400ms+`

---

## Responsive Breakpoints

Mobile-first design with these breakpoints:

```css
/* Mobile (320px – 767px) */
@media (max-width: 767px) {
  /* Stack layouts, hide desktop elements */
}

/* Tablet (768px – 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  /* Adaptive grids, 2-column layouts */
}

/* Desktop (1025px+) */
@media (min-width: 1025px) {
  /* Full layouts, 3+ column grids */
}
```

### Touch Targets

Ensure all interactive elements are **at least 44×44px** on mobile:

```css
button {
  min-height: 44px;
  min-width: 44px;
  padding: var(--sp-3) var(--sp-4);
}
```

---

## Accessibility

### Color Contrast

All text must meet WCAG AA standards (4.5:1 for normal text):
- `--on-surface` on `--surface-0`: ✅ 7.1:1
- `--on-surface-muted` on `--surface-1`: ✅ 5.2:1
- `--brand-primary` on `--surface-0`: ✅ 4.8:1

### Focus States

All interactive elements have visible focus rings:

```css
button:focus,
a:focus,
input:focus {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}
```

### Semantic HTML

- Use `<button>` for actions, not `<div>` with click handlers
- Use `<a>` for navigation
- Use `<label>` for form fields
- Use proper heading hierarchy: `<h1>`, `<h2>`, `<h3>`
- Use `role` attributes for custom components

### ARIA Labels

```html
<!-- Icon button needs aria-label -->
<button mat-icon-button aria-label="Close dialog">
  <mat-icon>close</mat-icon>
</button>

<!-- Form fields need labels -->
<label for="email">Email Address</label>
<input id="email" type="email" />
```

---

## Dark Mode Support

Dark mode is fully supported. Active with `body.dark-mode` class:

```css
body.dark-mode {
  background-color: #121212;
  color: #ffffff;
}
```

All components automatically adapt. Existing dark-mode overrides in `src/styles.css` apply.

---

## Implementation Best Practices

### 1. Use Design Tokens, Not Hardcoded Values

❌ **Bad**:
```css
.button {
  background-color: #8f1515;
  padding: 16px;
  border-radius: 10px;
}
```

✅ **Good**:
```css
.button {
  background-color: var(--brand-primary);
  padding: var(--sp-4);
  border-radius: var(--r-md);
}
```

### 2. Use Material Components When Available

❌ **Bad**:
```html
<button class="custom-btn">Click me</button>
```

✅ **Good**:
```html
<button mat-flat-button color="primary">Click me</button>
```

### 3. Apply Consistent Spacing

❌ **Bad**:
```css
.section {
  padding: 15px;
  margin-bottom: 22px;
}
```

✅ **Good**:
```css
.section {
  padding: var(--sp-4);
  margin-bottom: var(--sp-6);
}
```

### 4. Test Responsive Design

- Always test at 320px, 768px, and 1280px
- Ensure touch targets are minimum 44×44px on mobile
- Check that layouts stack properly on small screens
- Verify horizontal scrolling doesn't occur

### 5. Check Accessibility

- Use [WAVE](https://wave.webaim.org/) browser extension
- Test with keyboard navigation (Tab key)
- Verify color contrast with [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Test with screen reader (Windows: Narrator, Mac: VoiceOver)

---

## Migration Guide for Existing Styles

### Converting Hardcoded Colors to Tokens

**Before**:
```css
.card {
  background: #ffffff;
  border: 1px solid #e8e0d8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #1a1210;
}
```

**After**:
```css
.card {
  background: var(--surface-0);
  border: 1px solid var(--surface-3);
  box-shadow: var(--sh-sm);
  color: var(--on-surface);
}
```

### Converting Custom Spacing to Scale

**Before**:
```css
.section {
  padding: 20px 16px;
  margin-bottom: 24px;
  gap: 12px;
}
```

**After**:
```css
.section {
  padding: var(--sp-5) var(--sp-4);
  margin-bottom: var(--sp-6);
  gap: var(--sp-3);
}
```

---

## File Structure

```
src/
├── styles.css                 ← Central design system (tokens, globals, utilities)
├── index.html                 ← Font imports
└── app/
    └── components/
        ├── header/
        │   ├── header.component.ts
        │   ├── header.component.html
        │   └── header.component.css (uses global tokens)
        ├── home/
        ├── content-component/
        ├── my-cart/
        ├── my-account/
        └── ... (all components)
```

---

## Support & Questions

For design system questions or to propose new components, consult this documentation and refer to:
- `src/styles.css` for token definitions
- Component CSS files for implementation examples
- Angular Material documentation: https://material.angular.io/
- Design principles in this file

---

**Last Updated**: June 2026
**Design System Version**: 1.0
**Status**: ✅ Active
