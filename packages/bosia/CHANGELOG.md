# Changelog

All notable changes to the `bosia` framework package are documented here.

## [0.4.3] - 2026-05-09

### Changed

- Bosia now resolves each page route only once per request, instead of looking it up three or four times. Page loads, form submissions, and trailing-slash redirects are all slightly faster.
- Layout data merging is now linear in the number of layouts. Apps with deeply nested layouts will see a small speed-up on every page load.
- The list of public environment variables (those starting with `PUBLIC_`) is now built once when the server starts, instead of being recomputed on every response.

### Removed

- An internal pre-handler that double-checked API routes on every request has been removed. It was redundant — every HTTP method already routes through the same handler.
