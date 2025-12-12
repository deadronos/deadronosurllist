## 2025-12-12 - [Stored XSS via Zod .url()]
**Vulnerability:** Zod's `z.string().url()` validation accepts `javascript:`, `vbscript:`, and `data:` protocols, leading to Stored XSS when rendered in `href`.
**Learning:** Standard URL validation in libraries often focuses on structure (RFC 3986) rather than safety. "Valid URL" != "Safe URL".
**Prevention:** Explicitly whitelist allowed protocols (http/https) using `.refine()` or regex when validating URLs intended for user navigation.
