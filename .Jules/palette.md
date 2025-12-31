## 2025-05-18 - [Progressive Enhancement & Motion]
**Learning:** Found that content was invisible by default (`opacity: 0`) and relied on JS to appear. This violates progressive enhancement (users without JS see nothing). Also, lacking reduced motion support can cause motion sickness.
**Action:** When adding animations, always use `@media (prefers-reduced-motion: reduce)` to provide a safe fallback. Also, ensure base styles are visible and use classes (e.g., `.js-enabled`) to apply hiding styles for animation, ensuring content is accessible if JS fails.
