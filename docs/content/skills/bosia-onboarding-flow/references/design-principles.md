# Onboarding — principles

## Lineage

- open-design `skills/frontend-design` — step-flow discipline, single-decision-per-step.
- open-design `skills/login-flow` — auth-adjacent onboarding patterns.

## Why one decision per step

Every additional question on a step compounds drop-off. Studies repeatedly show that splitting a 6-field form across 3 steps converts better than one long page — provided the steps progress meaningfully.

The exception: well-known patterns (name + email + password on sign-up). Don't fragment what users expect to see together.

## Progress as commitment

Showing "2 of 4" creates a small commitment device: the user can see the end. Without it, the flow feels endless and abandonment rises.

Anti-pattern: showing progress that _grows_ ("Step 2 of ?"). If you don't know how many steps, don't show a count.

## Reversible

Onboarding should never feel like a one-way door. The back button must work on every step. Saving partial state on advance is what makes back-navigation safe.

## The "done" screen is the product

A separate "you're all set!" screen is a wasted click. The user came here to _use the product_; deliver them to the product surface as the reward.

## Skip discipline

"Skip for now" is honest when the step is truly optional. "Skip" with hidden friction (e.g., "Skip" actually returns to the same step in disguise) destroys trust permanently.
