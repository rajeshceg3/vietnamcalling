# Verify vietnamcalling
Vietnam: Ethereal Journey - static travel experience.
## Launch
Any static file server from the repo root.
## Doctor
`python3 .cursor/skills/verify-vietnamcalling/verify.py`
## Drive
Serves the static site and renders it in headless Chromium asserting the boot marker, hero section, and zero JS console errors.
## Evidence
`.cursor/skills/verify-vietnamcalling/evidence.json`
## Cleanup
Static server terminated after the render.
## Known boundaries
Render smoke only; e2e suites (playwright/karma) not exercised here.
