## 2025-12-12 - [Stored XSS via Zod .url()]
**Vulnerability:** Zod's `z.string().url()` validation accepts `javascript:`, `vbscript:`, and `data:` protocols, leading to Stored XSS when rendered in `href`.
**Learning:** Standard URL validation in libraries often focuses on structure (RFC 3986) rather than safety. "Valid URL" != "Safe URL".
**Prevention:** Explicitly whitelist allowed protocols (http/https) using `.refine()` or regex when validating URLs intended for user navigation.

## 2025-02-18 - [DoS via Strict Output Validation]
**Vulnerability:** Implementing strict validation on API outputs (e.g., throwing error on invalid URLs) can cause page crashes (DoS) if the database contains legacy invalid data.
**Learning:** Defense in depth requires *resilience*. Simply validating output schemas is not enough; one must assume bad data exists and sanitize/filter it gracefully instead of failing the request.
**Prevention:** Use `.filter()` or sanitization logic in mappers to remove invalid items before they hit strict schema validation or the frontend.
