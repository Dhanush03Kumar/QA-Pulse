---
name: regression-check
description: Compares a before/after screenshot of a component to confirm a functional change didn't alter its visual appearance. Requires the user to provide both screenshots — cannot verify visual regressions without them. Use after any change that touches a UI-rendering component.
---

# Regression Check — screenshot-driven, catches accidental visual drift

This skill CANNOT run without the user providing a "before" screenshot
(or the original Figma export reference) and an "after" screenshot of
the same component post-change. Do not assess visual correctness by
reading component code alone — passing className props in code doesn't
confirm the rendered result is unchanged.

## Steps
1. Ask for (if not already provided): the before/reference screenshot and
   the after screenshot of the same view/component.
2. Compare directly: layout, spacing, colors, typography, any shifted or
   missing elements. Look specifically for signs of accidental drift —
   e.g. a component falling back to browser-default styling (unstyled
   white background, default font) which usually means a class or wrapper
   got dropped during the functional change.
3. If a regression is found: identify the likely cause by checking the
   diff of the relevant file (git diff), not by guessing.
4. Fix ONLY the regression — restore the original styling/markup exactly.
   Do not use this as an opportunity to "improve" the design.
5. After fixing, tell the user exactly what to screenshot again to confirm.

## What to compare
$ARGUMENTS