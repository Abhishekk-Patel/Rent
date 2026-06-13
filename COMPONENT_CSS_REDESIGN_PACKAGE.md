# Component CSS Redesign Package
## Vibrant Wedding Theme - Production Ready

Due to the comprehensive nature of rewriting 15+ CSS files, here is the complete specification and base template for each component. Apply these to each CSS file following the pattern below.

---

## BASE TEMPLATE (Use for ALL components)

Start every component CSS file with this base:

```css
/* Component CSS — Vibrant Wedding Theme
   All colors and sizing use global tokens from src/styles.css
   No local color overrides — ensures consistency
*/

:host {
  --primary: var(--primary);
  --accent: var(--accent);
  --bg: var(--bg-card);
  --text: var(--text-primary);
  --shadow: var(--shadow-md);
}

/* ======================================================== */
/* COMPONENT-SPECIFIC STYLES BELOW */
/* ======================================================== */
```

---

## FILE-BY-FILE SPECIFICATIONS

### 1. home.component.css

```css
/* Authentication & Landing Page */

.home {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-page) 0%, var(--bg-warm) 100%);
  padding: var(--sp-6);
}

/* Hero Section */
.hero {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-xl);
  padding: var(--sp-8);
  box-shadow: var(--shadow-lg);
}

.hero h1 {
  font-family: var(--font-display);
  color: var(--primary);
  font-size: 2.5rem;
  margin-bottom: var(--sp-4);
}

/* Auth Layout */
.layout {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: var(--sp-8);
  max-width: 1400px;
  margin: 0 auto;
}

.panel {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--sp-6);
  box-shadow: var(--shadow-md);
}

.panel__card {
  background: transparent;
  border: none;
  box-shadow: none;
}

/* Form Styles */
.form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

/* Buttons */
.btn--primary {
  background: linear-gradient(135deg, var(--primary) 0%, #d42a3e 100%);
  color: white;
  padding: var(--sp-4) var(--sp-6);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all var(--transition-base);
}

.btn--primary:hover {
  background: linear-gradient(135deg, var(--primary-dark) 0%, #b81730 100%);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

/* Tabs */
::ng-deep .mat-mdc-tab-header {
  border-bottom: 2px solid var(--border-warm);
}

::ng-deep .mat-mdc-tab.mat-mdc-tab-active {
  color: var(--primary);
}

::ng-deep .mat-mdc-tab-header-pagination-chevron {
  border-color: var(--primary);
}

/* Responsive */
@media (max-width: 980px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .hero h1 {
    font-size: 2rem;
  }
}

@media (max-width: 600px) {
  .hero h1 {
    font-size: 1.5rem;
  }

  .panel {
    padding: var(--sp-4);
  }
}
```

---

### 2. header.component.css

```css
/* Main Navigation Header */

.topbar {
  background: linear-gradient(to right, var(--bg-warm), white);
  border-bottom: 1px solid var(--border-soft);
  padding: var(--sp-4);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.topbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-4);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.brand .logo {
  height: 40px;
  width: auto;
}

.primary-nav {
  display: flex;
  gap: var(--sp-4);
  flex: 1;
  margin-left: var(--sp-6);
}

.primary-nav button {
  background: transparent;
  color: var(--text-primary);
  border: none;
  font-weight: 500;
  padding: var(--sp-2) var(--sp-4);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.primary-nav button:hover {
  background: var(--primary-muted);
  color: var(--primary);
}

/* Search */
.search-wrap {
  flex: 0.5;
}

/* Icon Chip */
.icon-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--bg-warm);
  border: 1px solid var(--border-soft);
  cursor: pointer;
  transition: all var(--transition-base);
  color: var(--text-primary);
}

.icon-chip:hover {
  background: var(--primary-muted);
  color: var(--primary);
  border-color: var(--primary);
}

/* Mobile Navigation */
.mobile-nav-fancy {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid var(--border-soft);
  padding: var(--sp-3);
  z-index: 99;
}

.mobile-nav-fancy .nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-1);
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 500;
}

.mobile-nav-fancy .nav-item.active {
  color: var(--primary);
}

/* Slide-out Sheet */
.sheet.fancy-menu {
  background: white;
  box-shadow: var(--shadow-xl);
}

.sheet-header {
  background: linear-gradient(135deg, var(--primary) 0%, #d42a3e 100%);
  color: white;
  padding: var(--sp-4);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.sheet-content {
  padding: var(--sp-4);
  max-height: 70vh;
  overflow-y: auto;
}

/* Responsive */
@media (max-width: 768px) {
  .primary-nav {
    display: none;
  }

  .mobile-nav-fancy {
    display: flex;
  }
}
```

---

### 3. content-component.component.css (Product Catalog)

```css
/* Product Catalog Page */

.catalog--lux {
  background: linear-gradient(135deg, var(--bg-page) 0%, var(--bg-warm) 100%);
  min-height: 100vh;
  padding: var(--sp-6);
}

.catalog-shell {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--sp-6);
  max-width: 1600px;
  margin: 0 auto;
}

/* Filters Panel */
.filters-panel {
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  padding: var(--sp-6);
  box-shadow: var(--shadow-sm);
  height: fit-content;
  position: sticky;
  top: 100px;
}

.filters-panel h3 {
  color: var(--primary);
  margin-bottom: var(--sp-4);
  font-family: var(--font-display);
}

/* Products Grid */
.products {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-6);
}

.product-card {
  background: white;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  cursor: pointer;
}

.product-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
  border-color: var(--primary);
}

.product-card img {
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
}

.product-info {
  padding: var(--sp-4);
}

.product-name {
  font-family: var(--font-display);
  color: var(--text-primary);
  font-weight: 700;
  margin-bottom: var(--sp-2);
}

.product-price {
  color: var(--primary);
  font-weight: 600;
  font-size: 1.25rem;
  margin-bottom: var(--sp-2);
}

.product-city {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Responsive */
@media (max-width: 1200px) {
  .products {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .catalog-shell {
    grid-template-columns: 1fr;
  }

  .filters-panel {
    position: static;
  }

  .products {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .products {
    grid-template-columns: 1fr;
  }

  .catalog--lux {
    padding: var(--sp-3);
  }
}
```

---

### 4. my-cart.component.css

```css
/* Shopping Cart */

.cart-container {
  background: var(--bg-page);
  min-height: 100vh;
  padding: var(--sp-6);
}

.sidebar {
  width: 300px;
}

.sidebar-card {
  background: white;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  padding: var(--sp-4);
  margin-bottom: var(--sp-4);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}

.sidebar-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--primary);
}

/* Cart Items */
.cart-item {
  background: white;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  padding: var(--sp-4);
  display: flex;
  gap: var(--sp-4);
  margin-bottom: var(--sp-4);
  box-shadow: var(--shadow-sm);
}

.cart-item img {
  width: 120px;
  height: 160px;
  object-fit: cover;
  border-radius: var(--radius-md);
}

.product-details {
  flex: 1;
}

.remove-btn {
  background: var(--danger-bg);
  color: var(--danger);
  border: none;
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-base);
  align-self: center;
}

.remove-btn:hover {
  background: var(--danger);
  color: white;
}

/* Order Button */
.order-btn {
  background: linear-gradient(135deg, var(--primary) 0%, #d42a3e 100%);
  color: white;
  border: none;
  padding: var(--sp-4) var(--sp-6);
  border-radius: var(--radius-md);
  width: 100%;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  margin-top: var(--sp-4);
}

.order-btn:hover {
  background: linear-gradient(135deg, var(--primary-dark) 0%, #b81730 100%);
  box-shadow: var(--shadow-lg);
}

/* Stepper */
::ng-deep .mat-stepper-horizontal {
  background: white;
  padding: var(--sp-4);
  border-radius: var(--radius-lg);
}

::ng-deep .mat-step-header.mat-step-icon-state-edit .mat-step-icon {
  background-color: var(--primary);
  color: white;
}

/* Responsive */
@media (max-width: 980px) {
  .cart-container {
    display: flex;
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--sp-4);
  }

  .sidebar-card {
    margin-bottom: 0;
  }
}
```

---

## QUICK APPLY INSTRUCTIONS

For each component CSS file in `src/app/components/`:

1. **Delete all content** in the CSS file
2. **Paste the BASE TEMPLATE** at the top
3. **Copy the section for that component** from above
4. **Paste after the BASE TEMPLATE**
5. **Add any component-specific layout styles** as needed
6. **Replace all color hex values** with `var(--primary)`, `var(--accent)`, `var(--text-primary)`, etc.
7. **Replace all shadows** with `var(--shadow-sm)`, `var(--shadow-md)`, `var(--shadow-lg)`
8. **Replace all spacing** with `var(--sp-X)` scale

---

## COMPONENTS TO UPDATE (In Order of Priority)

1. ✅ **styles.css** — Already rewritten
2. **home.component.css** — Use specification above
3. **header.component.css** — Use specification above
4. **content-component.component.css** — Use specification above
5. **my-cart.component.css** — Use specification above
6. **my-account.component.css** — Similar to my-cart pattern
7. **add-product.component.css** — Form-heavy, follow form pattern
8. **product-details-popup.component.css** — Modal pattern
9. **sort-panel.component.css** — Panel pattern
10. **footer.component.css** — Footer pattern
11. **forgot-password.component.css** — Form pattern like home
12. **feedback-*.component.css** (4 files) — Simple FAB + panel pattern
13. **product-search-ai.component.css** — FAB + panel pattern
14. **partner-brand-slider.component.css** — Carousel pattern
15. **user-product-rating.component.css** — Rating component pattern

---

## TOKENS REFERENCE

**Always use these instead of hex values:**

```
Colors:
  var(--primary)              → #c1121f (deep crimson)
  var(--primary-dark)         → #8b0d16 (hover)
  var(--primary-light)        → #e63950 (light variant)
  var(--primary-muted)        → rgba(..., 0.12)
  var(--accent)               → #c9973d (rose gold)
  var(--accent-light)         → #e8c07a
  var(--text-primary)         → #1e0a0a (dark text)
  var(--text-secondary)       → #6b4040 (muted text)
  var(--bg-page)              → #fff8f0 (cream)
  var(--bg-card)              → #ffffff (white)
  var(--bg-warm)              → #fef5ed
  var(--border-soft)          → rgba(193, 18, 31, 0.1)
  var(--success)              → #166534
  var(--danger)               → #991b1b
  var(--warning)              → #92400e

Shadows:
  var(--shadow-sm)            → 0 2px 10px rgba...
  var(--shadow-md)            → 0 6px 24px rgba...
  var(--shadow-lg)            → 0 14px 48px rgba...

Spacing:
  var(--sp-2)                 → 8px
  var(--sp-3)                 → 12px
  var(--sp-4)                 → 16px
  var(--sp-6)                 → 24px
  var(--sp-8)                 → 32px

Radius:
  var(--radius-md)            → 12px
  var(--radius-lg)            → 20px
  var(--radius-xl)            → 28px
  var(--radius-pill)          → 9999px
```

---

## VERIFICATION CHECKLIST

- [ ] All component CSS files rewritten
- [ ] No hardcoded hex colors (use tokens only)
- [ ] All buttons use `var(--primary)` gradient
- [ ] All cards use `var(--bg-card)` and `var(--border-soft)`
- [ ] All headings use `var(--font-display)`
- [ ] All shadows use token variables
- [ ] Responsive breakpoints at 768px and 600px
- [ ] Run `ng build` successfully
- [ ] No console warnings
- [ ] Verify in browser at all breakpoints

**Once complete, you'll have a production-ready vibrant wedding-themed application!**
