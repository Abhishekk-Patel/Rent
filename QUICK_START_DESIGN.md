# Quick Start — Using the Design System

## For Developers: Copy-Paste Patterns

### Adding a New Button

```html
<!-- Primary Action -->
<button mat-flat-button color="primary" (click)="action()">
  Click Me
</button>

<!-- Secondary Action -->
<button mat-stroked-button (click)="action()">
  Cancel
</button>

<!-- Danger Action -->
<button class="btn btn-danger" (click)="delete()">
  <mat-icon>delete</mat-icon>
  Delete
</button>

<!-- Icon Button -->
<button mat-icon-button [matMenuTriggerFor]="menu" aria-label="More">
  <mat-icon>more_vert</mat-icon>
</button>
```

### Adding a Form Field

```html
<mat-form-field appearance="outline" class="w-100">
  <mat-label>Email</mat-label>
  <input matInput type="email" formControlName="email" />
  <mat-icon matPrefix>email</mat-icon>
  <mat-error *ngIf="form.get('email')?.hasError('required')">
    Email is required
  </mat-error>
</mat-form-field>
```

### Adding a Card

```html
<div class="card">
  <h3>Card Title</h3>
  <p>Card content here</p>
  <button mat-flat-button color="primary">Action</button>
</div>
```

Or with CSS:

```css
.my-card {
  background-color: var(--surface-0);
  border-radius: var(--r-lg);
  box-shadow: var(--sh-sm);
  border: 1px solid var(--border);
  padding: var(--sp-4);
}
```

### Adding Spacing

```css
.section {
  padding: var(--sp-6);        /* 24px padding */
  margin-bottom: var(--sp-8);  /* 32px margin */
  gap: var(--sp-3);            /* 12px gap between items */
}
```

### Adding a Badge

```html
<!-- Success Badge -->
<span class="badge badge-success">
  <mat-icon>check_circle</mat-icon>
  Verified
</span>

<!-- Danger Badge -->
<span class="badge badge-danger">
  <mat-icon>error</mat-icon>
  Error
</span>
```

### Making Something Responsive

```css
/* Mobile (default) */
.container {
  display: grid;
  grid-template-columns: 1fr;  /* 1 column */
  gap: var(--sp-4);
}

/* Tablet and above */
@media (min-width: 768px) {
  .container {
    grid-template-columns: repeat(2, 1fr);  /* 2 columns */
    gap: var(--sp-6);
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .container {
    grid-template-columns: repeat(3, 1fr);  /* 3 columns */
    gap: var(--sp-8);
  }
}
```

### Adding a Tooltip or Icon Label

```html
<button mat-icon-button matTooltip="Delete this item" aria-label="Delete">
  <mat-icon>delete</mat-icon>
</button>
```

### Creating an Empty State

```html
<div class="empty-state">
  <mat-icon style="font-size: 48px; width: 48px; height: 48px;">
    inbox
  </mat-icon>
  <h3>No items yet</h3>
  <p>Start by creating your first item</p>
  <button mat-flat-button color="primary">Create Item</button>
</div>
```

---

## Common Design Token Quick Reference

```css
/* Colors */
--brand-primary       /* Maroon - use for primary actions */
--brand-primary-dark  /* Dark maroon - use for hover/active */
--brand-accent        /* Gold - use for decorative accents */
--success             /* Green - use for success messages */
--danger              /* Red - use for errors */
--on-surface          /* Dark text - use for readability */
--border              /* Light border - use for dividers */

/* Spacing (always use these, never hardcode px) */
--sp-2   /* 8px */
--sp-3   /* 12px */
--sp-4   /* 16px - most common padding */
--sp-6   /* 24px - section spacing */

/* Corners */
--r-md   /* 10px - most buttons/inputs */
--r-lg   /* 16px - cards/modals */

/* Shadows */
--sh-sm  /* Cards */
--sh-md  /* Modals */
```

---

## Breakpoints Cheat Sheet

```css
/* Mobile first! */
/* Default: 320px–767px */

@media (min-width: 768px) {
  /* Tablet: 768px–1024px */
}

@media (min-width: 1025px) {
  /* Desktop: 1025px+ */
}
```

---

## Color Swatches

Copy-paste for design references:

| Token | Color | Hex |
|---|---|---|
| Primary | ■ Maroon | #8f1515 |
| Primary Dark | ■ Dark Maroon | #6b0f0f |
| Accent | ■ Gold | #c08b2d |
| Surface | ■ White | #ffffff |
| Background | ■ Off-white | #f8f7f6 |
| Text | ■ Dark | #1a1210 |
| Text Muted | ■ Gray | #6b5e58 |
| Success | ■ Green | #1e7e45 |
| Danger | ■ Red | #c0392b |

---

## Material Icons Cheat Sheet

Most-used icons in TryRentIT:

- `home` — Home
- `search` — Search
- `shopping_cart` — Cart
- `favorite` / `favorite_border` — Wishlist
- `person` — Profile
- `settings` — Settings
- `close` — Close/Exit
- `delete` — Delete
- `edit` — Edit
- `check_circle` — Success
- `error` / `cancel` — Error
- `warning` — Warning
- `info` — Information
- `chevron_left` / `chevron_right` — Navigation
- `arrow_back` — Back
- `arrow_forward` — Forward
- `more_vert` — More options
- `menu` — Menu
- `visibility` / `visibility_off` — Show/Hide
- `add` — Add
- `remove` — Remove

See all icons: https://fonts.google.com/icons

---

## DO's and DON'Ts

### ✅ DO

```css
/* Use design tokens */
.button {
  background: var(--brand-primary);
  padding: var(--sp-4);
  border-radius: var(--r-md);
}

/* Use Material components when available */
/* <button mat-flat-button color="primary"> */

/* Test responsive design */
/* @media (max-width: 767px) { ... } */

/* Add aria-labels to icons */
/* <button aria-label="Delete"> */
```

### ❌ DON'T

```css
/* Don't hardcode colors */
/* background: #8f1515; (WRONG) */

/* Don't hardcode spacing */
/* padding: 16px; (WRONG) */

/* Don't use raw HTML buttons */
/* <button class="my-button"> (use mat-flat-button) */

/* Don't forget mobile (test at 375px!) */

/* Don't skip accessibility */
/* icon buttons need aria-label */
```

---

## Quick Troubleshooting

**Q: Color looks wrong?**
A: Make sure you're using `var(--brand-primary)` not hardcoded hex. Rebuild if needed.

**Q: Spacing doesn't look right?**
A: Use `var(--sp-X)` from the spacing scale, not arbitrary pixel values.

**Q: Button styling not applying?**
A: Add `mat-flat-button` or `mat-stroked-button` directive. Check Material module is imported.

**Q: Form field looks ugly?**
A: Wrap in `<mat-form-field appearance="outline">`. Never use raw `<input>`.

**Q: Dark mode breaks?**
A: All colors should be tokens. Hard-coded colors won't update in dark mode.

**Q: Mobile layout looks cramped?**
A: Add `@media (max-width: 767px)` to stack layouts vertically. Use `var(--sp-3)` or `var(--sp-4)` for mobile.

---

## Need More Info?

See the complete documentation:
- **`DESIGN_SYSTEM.md`** — Full design system reference
- **`UI_MODERNIZATION_SUMMARY.md`** — Project overview
- **`src/styles.css`** — All tokens defined here
- **Component examples** — Look at any `.component.css` file in the project

---

**Remember**: Always use design tokens, test on mobile, and add accessibility labels! 🎨
